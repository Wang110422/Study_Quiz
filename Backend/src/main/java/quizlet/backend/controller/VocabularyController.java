package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.model.Vocabulary;
import quizlet.backend.services.VocabularyService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vocabularies")
public class VocabularyController {
    @Autowired
    private VocabularyService vocabularyService;

    @GetMapping("/{slug}")
    public ResponseEntity<APIResponse<List<VocabularyFlashCardDTO>>> getAll(@PathVariable String slug)
    {
        List<VocabularyFlashCardDTO> vocabularies = vocabularyService.getVocabulary(slug);

        APIResponse<List<VocabularyFlashCardDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(vocabularies);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{slug}")
    public ResponseEntity<APIResponse<List<VocabularyFlashCardDTO>>> create(@PathVariable String slug, @RequestBody List<VocabularyFlashCardDTO> requestDTO)
        {
        List<VocabularyFlashCardDTO> vocabularies = vocabularyService.createVocabulary(slug,requestDTO);
        APIResponse<List<VocabularyFlashCardDTO>> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Success");
        response.setResult(vocabularies);
        return ResponseEntity.ok(response);
        }
}
