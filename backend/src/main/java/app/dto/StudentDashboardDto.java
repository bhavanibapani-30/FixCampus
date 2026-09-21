package app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDto {
    private long myTotalRequests;
    private long pendingRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private List<RequestResponseDto> recentRequests;
}
