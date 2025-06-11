package com.boxing.backend.dto;

public class AuthResponseDTO {

    private String message;
    private UserResponseDTO user;
    private boolean success;

    // Construtores
    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String message, UserResponseDTO user, boolean success) {
        this.message = message;
        this.user = user;
        this.success = success;
    }

    // Getters e Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserResponseDTO getUser() {
        return user;
    }

    public void setUser(UserResponseDTO user) {
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
