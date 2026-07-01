package quizlet.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.base.APIResponse;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.model.StudySet;
import quizlet.backend.services.StudySetService;

import java.util.List;

@RestController
@RequestMapping("/api/studyset")
public class StudySetController {
    @Autowired
    private StudySetService studySetService;

    @GetMapping("/getAll")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> getAllStudySet(){
        List<StudySetDTO> studySets = studySetService.getAll();

        APIResponse<List<StudySetDTO>> response = new APIResponse<>();

        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(studySets);
        return ResponseEntity.ok(response);
    }
    @PostMapping
    public ResponseEntity<APIResponse<StudySetDTO>> createStudySet(@RequestBody StudySetDTO studySetDTO) {
        StudySetDTO studySetDTO1 = studySetService.createStudySet(studySetDTO);

        APIResponse<StudySetDTO> response = new APIResponse<>();

        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Success");
        response.setResult(studySetDTO1);
        return ResponseEntity.ok(response);
    }
}
