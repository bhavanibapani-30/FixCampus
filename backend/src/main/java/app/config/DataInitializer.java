package app.config;

import app.entity.*;
import app.repository.MaintenanceRequestRepository;
import app.repository.RequestUpdateRepository;
import app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MaintenanceRequestRepository requestRepository;
    private final RequestUpdateRepository updateRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            MaintenanceRequestRepository requestRepository,
            RequestUpdateRepository updateRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.updateRepository = updateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize Default Admin (10 characters: admin00001@anurag.edu.in)
        User admin = userRepository.findByEmail("admin00001@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("System Administrator")
                        .email("admin00001@anurag.edu.in")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build())
        );

        // Initialize Sample Technicians (10 characters: tech000001@anurag.edu.in, etc.)
        User techElectrical = userRepository.findByEmail("tech000001@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("John Sparks (Electrical)")
                        .email("tech000001@anurag.edu.in")
                        .password(passwordEncoder.encode("Tech@123"))
                        .role(Role.TECHNICIAN)
                        .createdAt(LocalDateTime.now().minusDays(25))
                        .build())
        );

        User techNetwork = userRepository.findByEmail("tech000002@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Sarah Fiber (Wi-Fi & IT)")
                        .email("tech000002@anurag.edu.in")
                        .password(passwordEncoder.encode("Tech@123"))
                        .role(Role.TECHNICIAN)
                        .createdAt(LocalDateTime.now().minusDays(25))
                        .build())
        );

        User techCivil = userRepository.findByEmail("tech000003@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Robert Woods (Furniture & Plumbing)")
                        .email("tech000003@anurag.edu.in")
                        .password(passwordEncoder.encode("Tech@123"))
                        .role(Role.TECHNICIAN)
                        .createdAt(LocalDateTime.now().minusDays(25))
                        .build())
        );

        User techAv = userRepository.findByEmail("tech000004@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("David Screen (Projector & AV)")
                        .email("tech000004@anurag.edu.in")
                        .password(passwordEncoder.encode("Tech@123"))
                        .role(Role.TECHNICIAN)
                        .createdAt(LocalDateTime.now().minusDays(25))
                        .build())
        );

        // Initialize Sample Students (10 characters: 21h61a0501@anurag.edu.in, 22h61a0502@anurag.edu.in)
        User student1 = userRepository.findByEmail("21h61a0501@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Alex Johnson (Roll No: 21H61A0501)")
                        .email("21h61a0501@anurag.edu.in")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .department("Computer Science & Engineering")
                        .createdAt(LocalDateTime.now().minusDays(20))
                        .build())
        );

        User student2 = userRepository.findByEmail("22h61a0502@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Emily Davis (Roll No: 22H61A0502)")
                        .email("22h61a0502@anurag.edu.in")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .department("Electronics Engineering")
                        .createdAt(LocalDateTime.now().minusDays(18))
                        .build())
        );

        // Initialize Sample Faculty (10 characters: faculty001@anurag.edu.in)
        User faculty = userRepository.findByEmail("faculty001@anurag.edu.in").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Dr. Rajesh Sharma (Faculty - CSE)")
                        .email("faculty001@anurag.edu.in")
                        .password(passwordEncoder.encode("Faculty@123"))
                        .role(Role.FACULTY)
                        .department("Computer Science & Engineering")
                        .createdAt(LocalDateTime.now().minusDays(15))
                        .build())
        );

        // Seed Sample Maintenance Requests if empty
        if (requestRepository.count() == 0) {
            // 1. Pending Request
            MaintenanceRequest req1 = MaintenanceRequest.builder()
                    .title("Ceiling Fan Making Loud Rattling Noise")
                    .description("The second ceiling fan near the back window produces a high-pitched vibrating sound when set to speed 3 or higher.")
                    .category(RequestCategory.FAN_AC)
                    .location("Mechanical Block - Seminar Hall 102")
                    .priority(RequestPriority.MEDIUM)
                    .status(RequestStatus.PENDING)
                    .student(student1)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .updatedAt(LocalDateTime.now().minusDays(1))
                    .build();
            req1 = requestRepository.save(req1);
            updateRepository.save(RequestUpdate.builder()
                    .request(req1)
                    .updatedBy(student1)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            // 2. Assigned Request
            MaintenanceRequest req2 = MaintenanceRequest.builder()
                    .title("Projector HDMI Display Port Not Working")
                    .description("The ceiling mounted projector is showing 'No Signal' when connected through HDMI cable. Power light is green but no display output.")
                    .category(RequestCategory.PROJECTOR)
                    .location("CSE Block - Room 204")
                    .priority(RequestPriority.HIGH)
                    .status(RequestStatus.ASSIGNED)
                    .student(student1)
                    .technician(techAv)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .updatedAt(LocalDateTime.now().minusHours(12))
                    .build();
            req2 = requestRepository.save(req2);
            updateRepository.save(RequestUpdate.builder()
                    .request(req2)
                    .updatedBy(student1)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req2)
                    .updatedBy(admin)
                    .oldStatus(RequestStatus.PENDING)
                    .newStatus(RequestStatus.ASSIGNED)
                    .comment("Assigned technician David Screen (Projector & AV). Priority confirmed as HIGH.")
                    .createdAt(LocalDateTime.now().minusHours(12))
                    .build());

            // 3. In Progress Request (Urgent)
            MaintenanceRequest req3 = MaintenanceRequest.builder()
                    .title("Campus Wi-Fi Access Point Offline in 3rd Floor Lab")
                    .description("All students in Computer Lab 3 cannot connect to the campus Wi-Fi network. SSID 'CAMPUS_SECURE_5G' is not broadcasting.")
                    .category(RequestCategory.WIFI)
                    .location("IT Tower - 3rd Floor Computer Lab 3")
                    .priority(RequestPriority.URGENT)
                    .status(RequestStatus.IN_PROGRESS)
                    .student(student2)
                    .technician(techNetwork)
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .updatedAt(LocalDateTime.now().minusHours(3))
                    .build();
            req3 = requestRepository.save(req3);
            updateRepository.save(RequestUpdate.builder()
                    .request(req3)
                    .updatedBy(student2)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req3)
                    .updatedBy(admin)
                    .oldStatus(RequestStatus.PENDING)
                    .newStatus(RequestStatus.ASSIGNED)
                    .comment("Assigned Sarah Fiber (Wi-Fi & IT). Marked as URGENT.")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req3)
                    .updatedBy(techNetwork)
                    .oldStatus(RequestStatus.ASSIGNED)
                    .newStatus(RequestStatus.IN_PROGRESS)
                    .comment("Technician Sarah Fiber started diagnosing Cisco AP switch uplink.")
                    .createdAt(LocalDateTime.now().minusHours(3))
                    .build());

            // 4. Resolved Request
            MaintenanceRequest req4 = MaintenanceRequest.builder()
                    .title("Water Cooler Filter Leaking on 1st Floor")
                    .description("Water is dripping continuously from the bottom valve of the RO water dispenser near the chemistry lab.")
                    .category(RequestCategory.WATER)
                    .location("Science Block - 1st Floor Corridor")
                    .priority(RequestPriority.MEDIUM)
                    .status(RequestStatus.RESOLVED)
                    .student(student1)
                    .technician(techCivil)
                    .resolutionNotes("Replaced the damaged pressure gasket and Teflon seal on the outlet valve. Tested water flow and verified zero leaks.")
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .updatedAt(LocalDateTime.now().minusDays(4))
                    .build();
            req4 = requestRepository.save(req4);
            updateRepository.save(RequestUpdate.builder()
                    .request(req4)
                    .updatedBy(student1)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req4)
                    .updatedBy(admin)
                    .oldStatus(RequestStatus.PENDING)
                    .newStatus(RequestStatus.ASSIGNED)
                    .comment("Assigned Robert Woods.")
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req4)
                    .updatedBy(techCivil)
                    .oldStatus(RequestStatus.ASSIGNED)
                    .newStatus(RequestStatus.IN_PROGRESS)
                    .comment("Technician Robert Woods began pipe inspection.")
                    .createdAt(LocalDateTime.now().minusDays(4).minusHours(4))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req4)
                    .updatedBy(techCivil)
                    .oldStatus(RequestStatus.IN_PROGRESS)
                    .newStatus(RequestStatus.RESOLVED)
                    .comment("Technician resolved request: Replaced the damaged pressure gasket and Teflon seal on the outlet valve.")
                    .createdAt(LocalDateTime.now().minusDays(4))
                    .build());

            // 5. Rejected Request
            MaintenanceRequest req5 = MaintenanceRequest.builder()
                    .title("Request for Personal Gaming Monitor in Hostel Room")
                    .description("Please install an ultra-wide monitor in Hostel B Room 301 for weekend leisure.")
                    .category(RequestCategory.OTHER)
                    .location("Hostel Block B - Room 301")
                    .priority(RequestPriority.LOW)
                    .status(RequestStatus.REJECTED)
                    .student(student2)
                    .createdAt(LocalDateTime.now().minusDays(6))
                    .updatedAt(LocalDateTime.now().minusDays(6))
                    .build();
            req5 = requestRepository.save(req5);
            updateRepository.save(RequestUpdate.builder()
                    .request(req5)
                    .updatedBy(student2)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusDays(6))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req5)
                    .updatedBy(admin)
                    .oldStatus(RequestStatus.PENDING)
                    .newStatus(RequestStatus.REJECTED)
                    .comment("Request rejected by Admin. Reason: Maintenance services are strictly reserved for college campus infrastructure and classroom facilities.")
                    .createdAt(LocalDateTime.now().minusDays(6))
                    .build());

            // 6. Electrical Switchboard Sparks
            MaintenanceRequest req6 = MaintenanceRequest.builder()
                    .title("Sparking Electrical Power Socket on Podium")
                    .description("The 3-pin power socket on the professor's podium in Lecture Hall 3 sparks whenever a laptop charger is plugged in.")
                    .category(RequestCategory.ELECTRICAL)
                    .location("Main Academic Block - Lecture Hall 3")
                    .priority(RequestPriority.URGENT)
                    .status(RequestStatus.ASSIGNED)
                    .student(faculty)
                    .technician(techElectrical)
                    .createdAt(LocalDateTime.now().minusHours(18))
                    .updatedAt(LocalDateTime.now().minusHours(6))
                    .build();
            req6 = requestRepository.save(req6);
            updateRepository.save(RequestUpdate.builder()
                    .request(req6)
                    .updatedBy(faculty)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by faculty Dr. Rajesh Sharma.")
                    .createdAt(LocalDateTime.now().minusHours(18))
                    .build());
            updateRepository.save(RequestUpdate.builder()
                    .request(req6)
                    .updatedBy(admin)
                    .oldStatus(RequestStatus.PENDING)
                    .newStatus(RequestStatus.ASSIGNED)
                    .comment("Assigned technician John Sparks for emergency electrical replacement.")
                    .createdAt(LocalDateTime.now().minusHours(6))
                    .build());

            // 7. Broken Desk Bench
            MaintenanceRequest req7 = MaintenanceRequest.builder()
                    .title("Broken Wooden Desk in Row 4")
                    .description("The wooden support plank under bench 4 in Room 105 has cracked and poses safety risk.")
                    .category(RequestCategory.FURNITURE)
                    .location("Civil Block - Room 105")
                    .priority(RequestPriority.MEDIUM)
                    .status(RequestStatus.PENDING)
                    .student(student1)
                    .createdAt(LocalDateTime.now().minusHours(4))
                    .updatedAt(LocalDateTime.now().minusHours(4))
                    .build();
            req7 = requestRepository.save(req7);
            updateRepository.save(RequestUpdate.builder()
                    .request(req7)
                    .updatedBy(student1)
                    .oldStatus(null)
                    .newStatus(RequestStatus.PENDING)
                    .comment("Maintenance request submitted by student.")
                    .createdAt(LocalDateTime.now().minusHours(4))
                    .build());
        }
    }
}
