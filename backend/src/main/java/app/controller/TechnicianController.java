package app.controller;

import app.dto.RequestResponseDto;
import app.dto.ResolveRequestDto;
import app.dto.TechnicianDashboardDto;
import app.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TechnicianDashboardDto> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        TechnicianDashboardDto dashboard = technicianService.getDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestResponseDto>> getAssignedRequests(@AuthenticationPrincipal UserDetails userDetails) {
        List<RequestResponseDto> requests = technicianService.getAssignedRequests(userDetails.getUsername());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<RequestResponseDto> getRequestDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto request = technicianService.getRequestDetails(id, userDetails.getUsername());
        return ResponseEntity.ok(request);
    }

    @PutMapping("/requests/{id}/start")
    public ResponseEntity<RequestResponseDto> startWork(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto updated = technicianService.startWork(id, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/requests/{id}/resolve")
    public ResponseEntity<RequestResponseDto> resolveRequest(
            @PathVariable Long id,
            @Valid @RequestBody ResolveRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto updated = technicianService.resolveRequest(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }
}
