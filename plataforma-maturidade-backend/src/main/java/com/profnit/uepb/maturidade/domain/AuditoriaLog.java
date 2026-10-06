package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_logs")
public class AuditoriaLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "usuario_identificacao")
    private String usuarioIdentificacao; // E-mail ou ID do usuário tentado

    @Column(nullable = false, length = 500)
    private String descricaoAcao;

    public AuditoriaLog() {}

    public AuditoriaLog(String usuarioIdentificacao, String descricaoAcao) {
        this.dataHora = LocalDateTime.now();
        this.usuarioIdentificacao = usuarioIdentificacao;
        this.descricaoAcao = descricaoAcao;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public String getUsuarioIdentificacao() { return usuarioIdentificacao; }
    public void setUsuarioIdentificacao(String usuarioIdentificacao) { this.usuarioIdentificacao = usuarioIdentificacao; }
    public String getDescriptionAcao() { return descricaoAcao; }
    public void setDescricaoAcao(String descricaoAcao) { this.descricaoAcao = descricaoAcao; }
}