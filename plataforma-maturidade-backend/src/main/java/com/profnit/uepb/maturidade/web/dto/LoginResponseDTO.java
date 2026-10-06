package com.profnit.uepb.maturidade.web.dto;

public class LoginResponseDTO {
    private String token;
    private String email;
    private String perfil;

    public LoginResponseDTO() {}

    public LoginResponseDTO(String token, String email, String perfil) {
        this.token = token;
        this.email = email;
        this.perfil = perfil;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }
}