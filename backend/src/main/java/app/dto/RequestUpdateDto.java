package app.dto;

import app.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestUpdateDto {
    private Long id;
    private UserDto updatedBy;
    private RequestStatus oldStatus;
    private RequestStatus newStatus;
    private String comment;
    private LocalDateTime createdAt;
}
