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
public class TechnicianDashboardDto {
    private long assignedRequests;
    private long inProgressRequests;
    private long resolvedRequests;
    private long highPriorityRequests;
    private List<RequestResponseDto> requests;
}
