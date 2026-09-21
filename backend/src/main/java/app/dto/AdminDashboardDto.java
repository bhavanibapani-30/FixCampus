package app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalRequests;
    private long pendingRequests;
    private long assignedRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private long rejectedRequests;
    private long urgentRequests;
    private long totalTechnicians;

    private Map<String, Long> requestsByCategory;
    private Map<String, Long> requestsByStatus;
    private List<RequestResponseDto> recentRequests;
    private List<RequestResponseDto> highPriorityRequests;
}
