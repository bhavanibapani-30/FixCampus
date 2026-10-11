package app.service;

import app.config.CustomUserDetails;
import app.config.JwtUtils;
import app.dto.AuthResponse;
import app.dto.LoginRequest;
import app.dto.RegisterRequest;
import app.entity.Role;
import app.entity.User;
import app.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @org.springframework.beans.factory.annotation.Value("${app.admin.security-key:CMS-ADMIN-2026}")
    private String adminSecurityKey;

    @org.springframework.beans.factory.annotation.Value("${app.technician.verification-key:CMS-TECH-2026}")
    private String technicianSecurityKey;

    @org.springframework.beans.factory.annotation.Value("${app.college.allowed-domains:anurag.edu.in}")
    private String allowedDomains;

    /**
     * Checks if email belongs to Anurag College and has exactly 10 characters before @anurag.edu.in
     * e.g. 21H61A0501@anurag.edu.in, faculty001@anurag.edu.in, tech000001@anurag.edu.in
     */
    public boolean isCollegeEmail(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }
        String trimmed = email.trim().toLowerCase();
        String[] parts = trimmed.split("@");
        if (parts.length != 2) {
            return false;
        }
        String username = parts[0];
        String domain = parts[1];

        if (!"anurag.edu.in".equalsIgnoreCase(domain)) {
            return false;
        }

        return username.length() == 10 && username.matches("^[a-zA-Z0-9._]{10}$");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Strict Outsider Check: Enforce Anurag College format (10 characters @anurag.edu.in)
        if (!isCollegeEmail(email)) {
            throw new IllegalArgumentException("Access Denied: Outsiders cannot join this system. Email must follow the official Anurag College format: exactly 10 characters before @anurag.edu.in (e.g. 21H61A0501@anurag.edu.in or faculty001@anurag.edu.in).");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists.");
        }

        // 2. Validate Allowed Roles for Registration
        Role assignedRole = request.getRole() != null ? request.getRole() : Role.STUDENT;

        if (assignedRole == Role.ADMIN) {
            throw new IllegalArgumentException("Management Access Denied: Administrator accounts cannot be self-registered publicly.");
        }

        // 3. Technician Staff Verification Check
        if (assignedRole == Role.TECHNICIAN) {
            String staffKey = request.getStaffKey() != null ? request.getStaffKey().trim() : "";
            if (!technicianSecurityKey.equals(staffKey)) {
                throw new IllegalArgumentException("Technician Authorization Failed: A valid technician verification key (default: " + technicianSecurityKey + ") is required to join as campus technician.");
            }
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : null)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getId(),
                savedUser.getName()
        );

        String roleTitle = assignedRole.name().substring(0, 1) + assignedRole.name().substring(1).toLowerCase();

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .message(roleTitle + " registration successful")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Enforce outsider barrier on sign in as well
        if (!isCollegeEmail(email)) {
            throw new IllegalArgumentException("Access Denied: Outsiders cannot sign in. Email must follow the official Anurag College format: 10 characters before @anurag.edu.in (e.g. 21H61A0501@anurag.edu.in).");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // Enforce Management Admin Security Key verification
        if (user.getRole() == Role.ADMIN) {
            String providedKey = request.getAdminKey() != null ? request.getAdminKey().trim() : "";
            if (!adminSecurityKey.equals(providedKey)) {
                throw new IllegalArgumentException("Management Access Denied: A valid Admin Security Key is required to sign in as Administrator.");
            }
        }

        String token = jwtUtils.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId(),
                user.getName()
        );

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}
