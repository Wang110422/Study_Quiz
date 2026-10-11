package quizlet.backend.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.services.JwtCacheService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtCacheService jwtCacheService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Lâấy jwt từ request
            String jwt = getJwtFromRequest(request);

            if(jwt == null || jwt.isBlank()) {
                filterChain.doFilter(request,response);
                return;
            }
            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                // Kiem tra nếu có jwi va xac trong redis
                String jti = jwtTokenProvider.getJtiFromToken(jwt);
                // Kiem tra trong redis neu có thì sẽ chặn request
                Boolean isBlacklisted = jwtCacheService.isBlacklistJwtToken(jti);

                if(isBlacklisted){
                    // Chặn request
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().println("Token is expired");
                    return;
                }
                String email = jwtTokenProvider.getEmailFromToken(jwt);
                Optional<User> userOptional = userRepository.findByEmail(email);

                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    String roleName = user.getRole() != null ? user.getRole().name() : "STUDENT";
                    List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user, null, authorities
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
        //Chuyển sang filter tiếp
                filterChain.doFilter(request, response);
            }
        } catch (ExpiredJwtException e) {
            logger.error("Token đã hết hạn: {}"+e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (UsernameNotFoundException e) {
            logger.error("Lỗi không có user trong hệ thống: {}"+e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (Exception e) {
            logger.error("Lỗi xác thực không xác định: {}"+e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        };
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("auth_token".equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.equals("/")
                || path.startsWith("/api/auth/")
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.equals("/error");
    }
}
