package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.GrammarSetDTO;
import quizlet.backend.services.GrammarSetService;

import java.util.List;

@RestController
@RequestMapping("/api/grammar-sets")
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
}
