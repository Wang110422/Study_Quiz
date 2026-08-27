package quizlet.backend.dto;

import lombok.Data;

@Data
public class UpdateProgressRequest {
    private String mode; // "LEARN" hoặc "TEST"
}
