package app.dto;

import app.entity.RequestCategory;
import app.entity.RequestPriority;
import app.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponseDto {
    private Long id;
    private String title;
    private String description;
    private RequestCategory category;
    private String location;
    private RequestPriority priority;
    private RequestStatus status;
    private UserDto student;
    private UserDto technician;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RequestUpdateDto> updates;
}
