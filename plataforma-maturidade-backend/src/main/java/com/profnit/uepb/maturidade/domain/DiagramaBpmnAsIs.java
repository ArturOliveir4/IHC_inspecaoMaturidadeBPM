package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagramas_bpmn_as_is")
public class DiagramaBpmnAsIs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(nullable = false)
    private String nomeOriginal;

    @Column(nullable = false)
    private String nomeArmazenado;

    @Column(nullable = false)
    private String formato;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long tamanhoBytes;

    @Column(nullable = false)
    private String caminhoArquivo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime enviadoEm;

    @Column(nullable = false, updatable = false)
    private String enviadoPor;

    public DiagramaBpmnAsIs() {}

    @PrePersist
    private void prePersist() {
        this.enviadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }
    public String getNomeOriginal() { return nomeOriginal; }
    public void setNomeOriginal(String nomeOriginal) { this.nomeOriginal = nomeOriginal; }
    public String getNomeArmazenado() { return nomeArmazenado; }
    public void setNomeArmazenado(String nomeArmazenado) { this.nomeArmazenado = nomeArmazenado; }
    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getTamanhoBytes() { return tamanhoBytes; }
    public void setTamanhoBytes(Long tamanhoBytes) { this.tamanhoBytes = tamanhoBytes; }
    public String getCaminhoArquivo() { return caminhoArquivo; }
    public void setCaminhoArquivo(String caminhoArquivo) { this.caminhoArquivo = caminhoArquivo; }
    public LocalDateTime getEnviadoEm() { return enviadoEm; }
    public String getEnviadoPor() { return enviadoPor; }
    public void setEnviadoPor(String enviadoPor) { this.enviadoPor = enviadoPor; }
}
