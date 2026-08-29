package quizlet.backend.dto.req;

import lombok.Data;

@Data
public class UpdateProgressRequest {
    private String mode; // "LEARN" hoặc "TEST"
}
