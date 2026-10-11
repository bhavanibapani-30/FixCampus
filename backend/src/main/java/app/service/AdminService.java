package app.service;

import app.dto.*;
import app.entity.*;
import app.repository.MaintenanceRequestRepository;
import app.repository.RequestUpdateRepository;
import app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final MaintenanceRequestRepository requestRepository;
    private final RequestUpdateRepository updateRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public AdminService(
            MaintenanceRequestRepository requestRepository,
            RequestUpdateRepository updateRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthService authService
    ) {
        this.requestRepository = requestRepository;
        this.updateRepository = updateRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        long totalRequests = requestRepository.count();
        long pending = requestRepository.countByStatus(RequestStatus.PENDING);
        long assigned = requestRepository.countByStatus(RequestStatus.ASSIGNED);
        long inProgress = requestRepository.countByStatus(RequestStatus.IN_PROGRESS);
        long resolved = requestRepository.countByStatus(RequestStatus.RESOLVED);
        long rejected = requestRepository.countByStatus(RequestStatus.REJECTED);
        long urgent = requestRepository.countByPriority(RequestPriority.URGENT);
        long totalTechnicians = userRepository.countByRole(Role.TECHNICIAN);

        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        for (RequestCategory cat : RequestCategory.values()) {
            categoryCounts.put(cat.name(), 0L);
        }
        for (Object[] row : requestRepository.countGroupByCategory()) {
            RequestCategory cat = (RequestCategory) row[0];
            Long count = (Long) row[1];
            categoryCounts.put(cat.name(), count);
        }

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (RequestStatus st : RequestStatus.values()) {
            statusCounts.put(st.name(), 0L);
        }
        for (Object[] row : requestRepository.countGroupByStatus()) {
            RequestStatus st = (RequestStatus) row[0];
            Long count = (Long) row[1];
            statusCounts.put(st.name(), count);
        }

        List<RequestResponseDto> recentRequests = requestRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());

        List<RequestResponseDto> highPriorityRequests = requestRepository.findByPriorityInAndStatusNotOrderByCreatedAtDesc(
                Arrays.asList(RequestPriority.URGENT, RequestPriority.HIGH),
                RequestStatus.RESOLVED
        ).stream().limit(5).map(DtoMapper::toRequestResponseDto).collect(Collectors.toList());

        return AdminDashboardDto.builder()
                .totalRequests(totalRequests)
                .pendingRequests(pending)
                .assignedRequests(assigned)
                .inProgressRequests(inProgress)
                .resolvedRequests(resolved)
                .rejectedRequests(rejected)
                .urgentRequests(urgent)
                .totalTechnicians(totalTechnicians)
                .requestsByCategory(categoryCounts)
                .requestsByStatus(statusCounts)
                .recentRequests(recentRequests)
                .highPriorityRequests(highPriorityRequests)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RequestResponseDto> getAllRequests(RequestStatus status, RequestCategory category, RequestPriority priority, String search) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return requestRepository.filterRequests(status, category, priority, trimmedSearch).stream()
                .map(DtoMapper::toRequestResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RequestResponseDto getRequestDetails(Long id) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));
        return DtoMapper.toRequestResponseDto(request);
    }

    @Transactional
    public RequestResponseDto assignTechnician(Long id, AssignTechnicianDto dto, String adminEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        User technician = userRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new IllegalArgumentException("Technician not found with ID: " + dto.getTechnicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Assigned user must have TECHNICIAN role");
        }

        RequestStatus oldStatus = request.getStatus();
        request.setTechnician(technician);
        request.setStatus(RequestStatus.ASSIGNED);
        MaintenanceRequest updated = requestRepository.save(request);

        String comment = (dto.getComment() != null && !dto.getComment().trim().isEmpty())
                ? dto.getComment().trim()
                : "Assigned technician " + technician.getName() + " by Admin.";

        RequestUpdate update = RequestUpdate.builder()
                .request(updated)
                .updatedBy(admin)
                .oldStatus(oldStatus)
                .newStatus(RequestStatus.ASSIGNED)
                .comment(comment)
                .build();
        updateRepository.save(update);

        return DtoMapper.toRequestResponseDto(updated);
    }

    @Transactional
    public RequestResponseDto updatePriority(Long id, UpdatePriorityDto dto, String adminEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        RequestPriority oldPriority = request.getPriority();
        request.setPriority(dto.getPriority());
        MaintenanceRequest updated = requestRepository.save(request);

        String comment = (dto.getComment() != null && !dto.getComment().trim().isEmpty())
                ? dto.getComment().trim()
                : "Priority changed from " + oldPriority + " to " + dto.getPriority() + " by Admin.";

        RequestUpdate update = RequestUpdate.builder()
                .request(updated)
                .updatedBy(admin)
                .oldStatus(request.getStatus())
                .newStatus(request.getStatus())
                .comment(comment)
                .build();
        updateRepository.save(update);

        return DtoMapper.toRequestResponseDto(updated);
    }

    @Transactional
    public RequestResponseDto rejectRequest(Long id, RejectRequestDto dto, String adminEmail) {
        MaintenanceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        RequestStatus oldStatus = request.getStatus();
        request.setStatus(RequestStatus.REJECTED);
        MaintenanceRequest updated = requestRepository.save(request);

        String comment = "Request rejected by Admin. Reason: " + dto.getReason().trim();

        RequestUpdate update = RequestUpdate.builder()
                .request(updated)
                .updatedBy(admin)
                .oldStatus(oldStatus)
                .newStatus(RequestStatus.REJECTED)
                .comment(comment)
                .build();
        updateRepository.save(update);

        return DtoMapper.toRequestResponseDto(updated);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(DtoMapper::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createTechnician(CreateTechnicianDto dto) {
        String email = dto.getEmail().trim().toLowerCase();

        if (!authService.isCollegeEmail(email)) {
            throw new IllegalArgumentException("Technician account must follow the official Anurag College format: 10 characters before @anurag.edu.in (e.g. tech000001@anurag.edu.in).");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + dto.getEmail() + " already exists.");
        }

        User technician = User.builder()
                .name(dto.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.TECHNICIAN)
                .build();

        User saved = userRepository.save(technician);
        return DtoMapper.toUserDto(saved);
    }
}
