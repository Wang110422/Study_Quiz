package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.SectionDTO;
import quizlet.backend.services.SectionService;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    // POST /api/sections
    // Nhận JSON Section gồm: examId, title, skill, orderIndex, passageGroups (kèm questions lồng nhau)
    @PostMapping
    public ResponseEntity<APIResponse<SectionDTO>> createSection(@RequestBody SectionDTO dto) {
        SectionDTO result = sectionService.createSection(dto);
        APIResponse<SectionDTO> response = new APIResponse<>();
        response.setStatus(HttpStatus.CREATED.value());
        response.setMessage("Tạo Section kèm cây PassageGroup và Questions thành công");
        response.setResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<SectionDTO>> getSectionDetail(@PathVariable Integer id) {
        SectionDTO section = sectionService.getSectionById(id);
        APIResponse<SectionDTO> response = new APIResponse<>();
        if (section == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setMessage("Không tìm thấy Section với ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Success");
        response.setResult(section);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> deleteSection(@PathVariable Integer id) {
        sectionService.deleteSection(id);
        APIResponse<Void> response = new APIResponse<>();
        response.setStatus(HttpStatus.OK.value());
        response.setMessage("Xóa Section thành công");
        return ResponseEntity.ok(response);
    }
}
