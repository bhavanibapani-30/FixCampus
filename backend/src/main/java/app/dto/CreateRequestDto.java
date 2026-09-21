package app.dto;

import app.entity.RequestCategory;
import app.entity.RequestPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private RequestCategory category;

    @NotBlank(message = "Location is required (e.g. CSE Block - Room 204)")
    private String location;

    @NotNull(message = "Priority is required")
    private RequestPriority priority;
}
