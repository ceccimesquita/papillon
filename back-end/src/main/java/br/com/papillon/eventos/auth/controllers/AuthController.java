package br.com.papillon.eventos.auth.controllers;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import br.com.papillon.eventos.auth.entities.User;
import br.com.papillon.eventos.auth.dtos.AuthRequest;
import br.com.papillon.eventos.auth.dtos.AuthResponse;
import br.com.papillon.eventos.auth.dtos.RegisterRequest;
import br.com.papillon.eventos.auth.repositories.UserRepository;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Value("${jwt.secret}")
    private String secret;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("[AUTH] Registrando novo usuário: " + request.getUsername());

        Optional<User> existing = userRepository.findByUsername(request.getUsername());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Usuário já existe");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_ADMIN"); // ou "ROLE_USER", dependendo da lógica

        userRepository.save(user);

        System.out.println("[AUTH] Usuário criado com sucesso");
        return ResponseEntity.ok("Usuário registrado com sucesso");
    }


    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        System.out.println("[AUTH] Tentando autenticar usuário: " + request.getUsername());

        try {
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    request.getUsername(), request.getPassword());

            authManager.authenticate(auth);
            System.out.println("[AUTH] Usuário autenticado com sucesso!");

            UserDetails user = userDetailsService.loadUserByUsername(request.getUsername());

            Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));

            String token = Jwts.builder()
                    .setSubject(user.getUsername())
                    .claim("role", user.getAuthorities().iterator().next().getAuthority())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1h
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();

            System.out.println("[AUTH] Token JWT gerado com sucesso.");
            return new AuthResponse(token);

        } catch (Exception e) {
            System.out.println("[AUTH] Falha na autenticação: " + e.getMessage());
            throw e;
        }
    }
}
