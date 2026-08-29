package quizlet.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import quizlet.backend.dto.res.APIResponse;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.model.User;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.services.FolderService;
import quizlet.backend.services.GoogleSheetService;
import quizlet.backend.services.StudySetService;

import java.util.List;

@RestController
@RequestMapping("/api/google")
public class GoogleController {
    @Autowired
    private GoogleSheetService googleSheetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudySetService studySetService;

    @Autowired
    private FolderService folderService;

    @PostMapping("/create_sheet")
    public ResponseEntity<APIResponse<String>> syncToGoogleSheet(
            @AuthenticationPrincipal User u,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String folderSlug
    ) {
        APIResponse<String> response = new APIResponse<>();
        if (u == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String accessToken = u.getGoogle_access_token();
        String refreshToken = u.getGoogle_refresh_token();

        if (accessToken == null || accessToken.isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Google access token is null");
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            if (folderId == null && (folderSlug == null || folderSlug.isBlank())) {
                // Đồng bộ 2 cấp: Root Folder [Tên Email] -> Sub-Folders [Tên Thư Mục Web] -> File Google Sheet
                String driveFolderUrl = googleSheetService.syncUserFoldersHierarchy(accessToken, refreshToken, u);

                response.setStatus(HttpStatus.OK.value());
                response.setMessage("Đã đồng bộ toàn bộ Thư mục theo Email người dùng lên Google Drive thành công!");
                response.setResult(driveFolderUrl);
                return ResponseEntity.ok(response);
            }

            List<StudySetDTO> studySetDTOS;
            String sheetName = "VocaLearn_Sheet";

            if (folderId != null) {
                studySetDTOS = studySetService.getAllByFolderId(folderId);
                FolderDTO folder = folderService.getFolderById(folderId);
                if (folder != null) sheetName = folder.getName();
            } else {
                studySetDTOS = studySetService.getAllByFolderSlug(folderSlug);
                FolderDTO folder = folderService.getFolderBySlug(folderSlug);
                if (folder != null) sheetName = folder.getName();
            }

            if (u.getSheetId() == null || u.getSheetId().isBlank()) {
                String sheetId = googleSheetService.createGoogleDriveFolderAndSheet(accessToken, refreshToken, sheetName);
                u.setSheetId(sheetId);
                userRepository.save(u);

                if (!studySetDTOS.isEmpty()) {
                    googleSheetService.writeGoogleSheet(accessToken, refreshToken, studySetDTOS, sheetId);
                }

                response.setStatus(HttpStatus.OK.value());
                response.setMessage("Đã tạo mới Folder & Sheet trên Google Drive thành công");
                response.setResult("https://docs.google.com/spreadsheets/d/" + sheetId);
                return ResponseEntity.ok(response);
            } else {
                googleSheetService.updateGoogleSheet(accessToken, refreshToken, u.getId(), folderId, u.getSheetId());

                response.setStatus(HttpStatus.OK.value());
                response.setMessage("Đồng bộ dữ liệu thành công lên Google Sheet");
                response.setResult("https://docs.google.com/spreadsheets/d/" + u.getSheetId());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi đồng bộ Google: " + e.getMessage());
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/sync_sheet_to_web")
    public ResponseEntity<APIResponse<List<StudySetDTO>>> syncToWeb(
            @AuthenticationPrincipal User u,
            @RequestParam(required = false) Long folderId
    ) {
        APIResponse<List<StudySetDTO>> response = new APIResponse<>();
        if (u == null) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Chưa đăng nhập");
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String accessToken = u.getGoogle_access_token();
        if (accessToken == null || accessToken.isBlank()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setMessage("Google access token is null");
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String sheetId = u.getSheetId();
        if (sheetId == null || sheetId.isBlank()) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setMessage("Sheet Id is null");
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            List<StudySetDTO> studySetDTOS = googleSheetService.syncGoogleSheetToWeb(sheetId, accessToken, folderId,u);
            response.setStatus(HttpStatus.OK.value());
            response.setMessage("Đồng bộ từ Google Sheet về Web thành công");
            response.setResult(studySetDTOS);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setMessage("Lỗi đồng bộ từ Google Sheet về Web: " + e.getMessage());
            response.setResult(null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
