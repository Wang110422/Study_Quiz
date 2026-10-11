package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.GrammarSetDTO;
import quizlet.backend.services.GrammarSetService;

import java.util.List;

@RestController
@RequestMapping("/api/grammar-sets")
@PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
public class GrammarSetController {

    @Autowired
    private GrammarSetService grammarSetService;

    @GetMapping
    public ResponseEntity<APIResponse<List<GrammarSetDTO>>> getAllGrammarSets() {
        List<GrammarSetDTO> list = grammarSetService.getAllGrammarSets();
        APIResponse<List<GrammarSetDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<APIResponse<List<GrammarSetDTO>>> getAllGrammarSetsAlias() {
        return getAllGrammarSets();
    }

    @GetMapping("/{slug}")
    public ResponseEntity<APIResponse<GrammarSetDTO>> getGrammarSetBySlug(@PathVariable String slug) {
        GrammarSetDTO set = grammarSetService.getGrammarSetBySlug(slug);
        APIResponse<GrammarSetDTO> response = new APIResponse<>();
        if (set == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy bộ ngữ pháp");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(set);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<APIResponse<GrammarSetDTO>> createGrammarSet(
            @RequestBody quizlet.backend.dto.req.CreateGrammarSetRequest request,
            org.springframework.security.core.Authentication authentication
    ) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            APIResponse<GrammarSetDTO> error = new APIResponse<>();
            error.setStatus(HttpStatus.BAD_REQUEST.value());
            error.setMessage("Tiêu đề bộ ngữ pháp không được để trống");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String userEmail = authentication != null ? authentication.getName() : null;
        GrammarSetDTO created = grammarSetService.createGrammarSet(request, userEmail);
        APIResponse<GrammarSetDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo bộ ngữ pháp thành công");
        response.setResult(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
