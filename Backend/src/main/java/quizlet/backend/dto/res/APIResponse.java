package quizlet.backend.dto.res;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class APIResponse<T> {
    private int status;
    private String message;
    private T result;
}