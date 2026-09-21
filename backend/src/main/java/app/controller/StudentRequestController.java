package app.controller;

import app.dto.CreateRequestDto;
import app.dto.RequestResponseDto;
import app.dto.StudentDashboardDto;
import app.service.StudentRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class StudentRequestController {

    private final StudentRequestService studentRequestService;

    public StudentRequestController(StudentRequestService studentRequestService) {
        this.studentRequestService = studentRequestService;
    }

    @PostMapping
    public ResponseEntity<RequestResponseDto> createRequest(
            @Valid @RequestBody CreateRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto response = studentRequestService.createRequest(dto, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<RequestResponseDto>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<RequestResponseDto> response = studentRequestService.getMyRequests(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestResponseDto> getRequestDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RequestResponseDto response = studentRequestService.getRequestDetails(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDto> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        StudentDashboardDto response = studentRequestService.getDashboardStats(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
