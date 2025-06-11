package com.boxing.backend.service;

import com.boxing.backend.domain.User;
import com.boxing.backend.dto.*;
import com.boxing.backend.exception.EmailAlreadyExistsException;
import com.boxing.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponseDTO register(RegisterRequestDTO registerRequest) {
        try {
            // Verificar se o email já existe
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                throw new EmailAlreadyExistsException("Email já está em uso");
            }

            // Criar novo usuário
            User user = new User();
            user.setName(registerRequest.getName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

            // Salvar no banco
            User savedUser = userRepository.save(user);

            // Criar DTO de resposta
            UserResponseDTO userResponse = new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
            );

            return new AuthResponseDTO("Usuário cadastrado com sucesso!", userResponse, true);

        } catch (EmailAlreadyExistsException e) {
            return new AuthResponseDTO(e.getMessage(), null, false);
        } catch (Exception e) {
            return new AuthResponseDTO("Erro interno do servidor", null, false);
        }
    }

    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        try {
            // Buscar usuário por email
            Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

            if (userOptional.isEmpty()) {
                return new AuthResponseDTO("Credenciais inválidas", null, false);
            }

            User user = userOptional.get();

            // Verificar senha
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return new AuthResponseDTO("Credenciais inválidas", null, false);
            }

            // Criar DTO de resposta
            UserResponseDTO userResponse = new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
            );

            return new AuthResponseDTO("Login realizado com sucesso!", userResponse, true);

        } catch (Exception e) {
            return new AuthResponseDTO("Erro interno do servidor", null, false);
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserResponseDTO getUserById(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
            );
        }
        return null;
    }    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
            .map(user -> new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllUsersWithHash() {
        List<User> users = userRepository.findAll();
        return users.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("passwordHash", user.getPassword()); // Mostra o hash da senha
                userMap.put("createdAt", user.getCreatedAt());
                return userMap;
            })
            .collect(Collectors.toList());
    }
}
