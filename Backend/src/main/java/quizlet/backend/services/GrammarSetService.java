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

    @Autowired
    private quizlet.backend.repository.UserRepository userRepository;

    @Autowired
    private quizlet.backend.repository.FolderRepository folderRepository;

    @Transactional
    public GrammarSetDTO createGrammarSet(quizlet.backend.dto.req.CreateGrammarSetRequest request, String userEmail) {
        GrammarSet set = new GrammarSet();
        set.setTilte(request.getTitle().trim());
        set.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        set.setIsDel(false);

        String baseSlug = toSlug(request.getTitle().trim());
        String slug = baseSlug;
        while (grammarSetRepository.findBySlugAndIsDelFalse(slug).isPresent()) {
            slug = baseSlug + "-" + (System.currentTimeMillis() % 100000);
        }
        set.setSlug(slug);

        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(set::setUser);
        }

        if (request.getFolderId() != null) {
            folderRepository.findById(request.getFolderId()).ifPresent(set::setFolder);
        }

        GrammarSet saved = grammarSetRepository.save(set);
        return mapToDTO(saved);
    }

    private String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "grammar-" + System.currentTimeMillis();
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        String noDiacritics = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        String slug = noDiacritics.toLowerCase()
                .replace("đ", "d")
                .replace("Đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isEmpty() ? "grammar-" + System.currentTimeMillis() : slug;
    }

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
