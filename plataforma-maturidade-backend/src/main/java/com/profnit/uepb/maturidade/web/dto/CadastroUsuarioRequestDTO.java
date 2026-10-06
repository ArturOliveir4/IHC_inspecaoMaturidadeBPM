package com.profnit.uepb.maturidade.web.dto;

public class CadastroUsuarioRequestDTO {
    private String email;
    private String senha;
    private String perfil;

    public CadastroUsuarioRequestDTO() {}

    public CadastroUsuarioRequestDTO(String email, String senha, String perfil) {
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }
}
