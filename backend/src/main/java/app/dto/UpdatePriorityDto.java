package app.dto;

import app.entity.RequestPriority;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePriorityDto {

    @NotNull(message = "Priority is required")
    private RequestPriority priority;

    private String comment;
}
