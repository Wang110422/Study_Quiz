package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.GrammarDTO;
import quizlet.backend.dto.GrammarSetDTO;
import quizlet.backend.model.Grammar;
import quizlet.backend.model.GrammarSet;
import quizlet.backend.repository.GrammarRepository;
import quizlet.backend.repository.GrammarSetRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GrammarSetService {

    @Autowired
    private GrammarSetRepository grammarSetRepository;

    @Autowired
    private GrammarRepository grammarRepository;

    @Transactional(readOnly = true)
    public List<GrammarSetDTO> getAllGrammarSets() {
        List<GrammarSet> list = grammarSetRepository.findAllByIsDelFalse();
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GrammarSetDTO getGrammarSetBySlug(String slug) {
        GrammarSet set = grammarSetRepository.findBySlugAndIsDelFalse(slug)
                .orElse(null);
        if (set == null) return null;
        return mapToDTOWithDetails(set);
    }

    @Transactional(readOnly = true)
    public GrammarSetDTO getGrammarSetById(Long id) {
        GrammarSet set = grammarSetRepository.findById(id).orElse(null);
        if (set == null) return null;
        return mapToDTOWithDetails(set);
    }

    private GrammarSetDTO mapToDTO(GrammarSet set) {
        int count = set.getGrammars() != null ? set.getGrammars().size() : 0;
        String author = "Hệ thống";
        Long userId = null;
        if (set.getUser() != null) {
            userId = set.getUser().getId();
            String name = (set.getUser().getFirstName() != null ? set.getUser().getFirstName() : "") + " " +
                    (set.getUser().getLastName() != null ? set.getUser().getLastName() : "");
            author = name.trim().isEmpty() ? set.getUser().getEmail() : name.trim();
        }

        return GrammarSetDTO.builder()
                .id(set.getId())
                .title(set.getTilte() != null ? set.getTilte() : "Bộ ngữ pháp")
                .description(set.getDescription())
                .slug(set.getSlug())
                .emoji("📐")
                .grammarCount(count)
                .level("Trung cấp")
                .isDel(set.getIsDel())
                .createdAt(set.getCreatedAt())
                .userId(userId)
                .authorName(author)
                .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                .folderName(set.getFolder() != null ? set.getFolder().getName() : null)
                .folderSlug(set.getFolder() != null ? set.getFolder().getSlug() : null)
                .build();
    }

    private GrammarSetDTO mapToDTOWithDetails(GrammarSet set) {
        List<GrammarDTO> grammarDTOs = Collections.emptyList();
        if (set.getGrammars() != null) {
            grammarDTOs = set.getGrammars().stream().map(g -> GrammarDTO.builder()
                    .id(g.getId())
                    .title(g.getTitle())
                    .structure(g.getStructure())
                    .explanation(g.getExplanation())
                    .example(g.getExample())
                    .description(g.getDescription())
                    .createdAt(g.getCreatedAt())
                    .grammarSetId(set.getId())
                    .build()
            ).collect(Collectors.toList());
        }

        String author = "Hệ thống";
        Long userId = null;
        if (set.getUser() != null) {
            userId = set.getUser().getId();
            String name = (set.getUser().getFirstName() != null ? set.getUser().getFirstName() : "") + " " +
                    (set.getUser().getLastName() != null ? set.getUser().getLastName() : "");
            author = name.trim().isEmpty() ? set.getUser().getEmail() : name.trim();
        }

        return GrammarSetDTO.builder()
                .id(set.getId())
                .title(set.getTilte() != null ? set.getTilte() : "Bộ ngữ pháp")
                .description(set.getDescription())
                .slug(set.getSlug())
                .emoji("📐")
                .grammarCount(grammarDTOs.size())
                .level("Trung cấp")
                .isDel(set.getIsDel())
                .createdAt(set.getCreatedAt())
                .userId(userId)
                .authorName(author)
                .folderId(set.getFolder() != null ? set.getFolder().getId() : null)
                .folderName(set.getFolder() != null ? set.getFolder().getName() : null)
                .folderSlug(set.getFolder() != null ? set.getFolder().getSlug() : null)
                .grammars(grammarDTOs)
                .build();
    }
}
