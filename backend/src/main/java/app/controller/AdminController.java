package app.controller;

import app.dto.*;
import app.entity.RequestCategory;
import app.entity.RequestPriority;
import app.entity.RequestStatus;
import app.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        AdminDashboardDto dashboard = adminService.getDashboardStats();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<RequestResponseDto>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) RequestCategory category,
            @RequestParam(required = false) RequestPriority priority,
            @RequestParam(required = false) String search
    ) {
        List<RequestResponseDto> requests = adminService.getAllRequests(status, category, priority, search);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<RequestResponseDto> getRequestDetails(@PathVariable Long id) {
        RequestResponseDto request = adminService.getRequestDetails(id);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/requests/{id}/assign")
    public ResponseEntity<RequestResponseDto> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto updated = adminService.assignTechnician(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/requests/{id}/priority")
    public ResponseEntity<RequestResponseDto> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriorityDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto updated = adminService.updatePriority(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<RequestResponseDto> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto updated = adminService.rejectRequest(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserDto>> getTechnicians() {
        List<UserDto> technicians = adminService.getTechnicians();
        return ResponseEntity.ok(technicians);
    }

    @PostMapping("/technicians")
    public ResponseEntity<UserDto> createTechnician(@Valid @RequestBody CreateTechnicianDto dto) {
        UserDto created = adminService.createTechnician(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
