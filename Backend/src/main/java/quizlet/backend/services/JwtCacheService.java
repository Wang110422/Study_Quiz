package quizlet.backend.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import quizlet.backend.security.jwt.JwtTokenProvider;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class JwtCacheService {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    public void blackListJwtToken(String token){
        String jti = jwtTokenProvider.getJtiFromToken(token);
        Date expiration = jwtTokenProvider.getExpirationFromToken(token);
        // Thoi gian còn lại để server thu hồi jwt
        Long remainingSeconds = expiration.getTime() - System.currentTimeMillis();
        if (remainingSeconds > 0 && jti != null) {
        //[service/domain]:[entity]:[id]:[sub-entity/attribute]
        // service trong này là blacklist (chặn jwt) , jwt la dto/entity , id là mã định danh của người đó
            String redisKey = "blacklist:jwt:" + jti;
            stringRedisTemplate.opsForValue().set(redisKey, "revoked", remainingSeconds, TimeUnit.MILLISECONDS);
            System.out.println("key:"+redisKey + " thêm key thanh công");
        }
    }
    public Boolean isBlacklistJwtToken(String jti){
        String key = "blacklist:jwt:"+jti ;
        System.out.println("check"+Boolean.TRUE.equals(stringRedisTemplate.hasKey(key)));
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
    }
}
