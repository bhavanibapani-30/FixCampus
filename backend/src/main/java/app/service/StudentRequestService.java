package app.service;

import app.dto.CreateRequestDto;
import app.dto.DtoMapper;
import app.dto.RequestResponseDto;
import app.dto.StudentDashboardDto;
import app.entity.MaintenanceRequest;
import app.entity.RequestStatus;
import app.entity.RequestUpdate;
import app.entity.User;
import app.repository.MaintenanceRequestRepository;
import app.repository.RequestUpdateRepository;
import app.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentRequestService {

    private final MaintenanceRequestRepository requestRepository;
    private final RequestUpdateRepository updateRepository;
    private final UserRepository userRepository;

    public StudentRequestService(
            MaintenanceRequestRepository requestRepository,
            RequestUpdateRepository updateRepository,
            UserRepository userRepository
    ) {
        this.requestRepository = requestRepository;
        this.updateRepository = updateRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RequestResponseDto createRequest(CreateRequestDto dto, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        MaintenanceRequest request = MaintenanceRequest.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .category(dto.getCategory())
                .location(dto.getLocation().trim())
                .priority(dto.getPriority())
                .status(RequestStatus.PENDING)
                .student(student)
                .build();

        MaintenanceRequest savedRequest = requestRepository.save(request);

        // Record initial status update history
        RequestUpdate initialUpdate = RequestUpdate.builder()
                .request(savedRequest)
                .updatedBy(student)
                .oldStatus(null)
                .newStatus(RequestStatus.PENDING)
                .comment("Maintenance request submitted by student.")
                .build();
        updateRepository.save(initialUpdate);

        savedRequest.getUpdates().add(initialUpdate);
        return DtoMapper.toRequestResponseDto(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<RequestResponseDto> getMyRequests(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return requestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RequestResponseDto getRequestDetails(Long id, String studentEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        if (!request.getStudent().getEmail().equalsIgnoreCase(studentEmail)) {
            throw new AccessDeniedException("You are not authorized to view another student's request.");
        }

        return DtoMapper.toRequestResponseDto(request);
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto getDashboardStats(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Long studentId = student.getId();
        long total = requestRepository.countByStudentId(studentId);
        long pending = requestRepository.countByStudentIdAndStatus(studentId, RequestStatus.PENDING);
        long inProgress = requestRepository.countByStudentIdAndStatus(studentId, RequestStatus.IN_PROGRESS)
                + requestRepository.countByStudentIdAndStatus(studentId, RequestStatus.ASSIGNED);
        long resolved = requestRepository.countByStudentIdAndStatus(studentId, RequestStatus.RESOLVED);

        List<RequestResponseDto> allMy = requestRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .limit(5)
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());

        return StudentDashboardDto.builder()
                .myTotalRequests(total)
                .pendingRequests(pending)
                .inProgressRequests(inProgress)
                .resolvedRequests(resolved)
                .recentRequests(allMy)
                .build();
    }
}
