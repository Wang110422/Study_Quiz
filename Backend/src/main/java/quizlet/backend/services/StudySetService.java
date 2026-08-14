package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.helper.SlugUtil;
import quizlet.backend.model.Folder;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.Vocabulary;
import quizlet.backend.repository.FolderRepository;
import quizlet.backend.repository.StudySetRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudySetService {
    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private FolderRepository folderRepository;

    public List<StudySetDTO> getAllStudySets() {
        return studySetRepository.findAll()
                .stream()
                .filter(s -> s.getIsDel() == null || !s.getIsDel())
                .map(this::convertStudySetDTO)
                .collect(Collectors.toList());
    }

    public List<StudySetDTO> getAllByFolderId(Long folderId) {
        return studySetRepository.findByFolderId(folderId)
                .stream()
                .filter(s -> s.getIsDel() == null || !s.getIsDel())
                .map(this::convertStudySetDTO)
                .collect(Collectors.toList());
    }

    public List<StudySetDTO> getDeletedByUserId(Long userId) {
        return studySetRepository.findByFolderUserIdAndIsDelTrue(userId)
                .stream()
                .map(this::convertStudySetDTO)
                .collect(Collectors.toList());
    }

    public List<StudySetDTO> getAllByFolderSlug(String folderSlug) {
        return studySetRepository.findByFolderSlug(folderSlug)
                .stream()
                .filter(s -> s.getIsDel() == null || !s.getIsDel())
                .map(this::convertStudySetDTO)
                .collect(Collectors.toList());
    }

    public List<StudySetDTO> getAllByFolderName(String folderName) {
        return studySetRepository.findByFolderNameContainingIgnoreCase(folderName)
                .stream()
                .filter(s -> s.getIsDel() == null || !s.getIsDel())
                .map(this::convertStudySetDTO)
                .collect(Collectors.toList());
    }

    public StudySetDTO createStudySet(StudySetDTO studySetDTO) {
        StudySet studySet = convertStudySet(studySetDTO);

        Folder folder = null;
        if (studySetDTO.getFolderId() != null) {
            folder = folderRepository.findById(studySetDTO.getFolderId()).orElse(null);
        } else if (studySetDTO.getFolderSlug() != null && !studySetDTO.getFolderSlug().isEmpty()) {
            folder = folderRepository.findBySlug(studySetDTO.getFolderSlug()).orElse(null);
        }

        String slug = SlugUtil.toSlug(studySet.getTitleName());
        if (studySetRepository.existsBySlug(slug)) {
            slug += "_" + System.currentTimeMillis();
        }

        studySet.setSlug(slug);
        studySet.setFolder(folder);
        studySet.setIsDel(false);

        if (studySetDTO.getVocabularies() != null && !studySetDTO.getVocabularies().isEmpty()) {
            List<Vocabulary> vocabularies = studySetDTO.getVocabularies().stream().map(vDto -> {
                Vocabulary v = new Vocabulary();
                v.setTerm(vDto.getTerm());
                v.setDefinition(vDto.getDefinition());
                v.setIsDel(false);
                v.setStudySet(studySet);
                return v;
            }).collect(Collectors.toList());
            studySet.setVocabularies(vocabularies);
        }

        return convertStudySetDTO(studySetRepository.save(studySet));
    }

    public boolean softDeleteStudySet(Long id) {
        StudySet set = studySetRepository.findById(id).orElse(null);
        if (set != null) {
            set.setIsDel(true);
            studySetRepository.save(set);
            return true;
        }
        return false;
    }

    public boolean restoreStudySet(Long id) {
        StudySet set = studySetRepository.findById(id).orElse(null);
        if (set != null) {
            set.setIsDel(false);
            studySetRepository.save(set);
            return true;
        }
        return false;
    }

    public boolean permanentDeleteStudySet(Long id) {
        if (studySetRepository.existsById(id)) {
            studySetRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public StudySetDTO convertStudySetDTO(StudySet studySet) {
        StudySetDTO dto = new StudySetDTO();
        dto.setId(studySet.getId());
        dto.setTitleName(studySet.getTitleName());
        dto.setDescription(studySet.getDescription());
        dto.setSlug(studySet.getSlug());
        dto.setIsDel(studySet.getIsDel());
        if (studySet.getFolder() != null) {
            dto.setFolderId(studySet.getFolder().getId());
            dto.setFolderSlug(studySet.getFolder().getSlug());
        }
        return dto;
    }

    public StudySet convertStudySet(StudySetDTO dto) {
        StudySet studySet = new StudySet();
        studySet.setTitleName(dto.getTitleName());
        studySet.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        studySet.setIsDel(dto.getIsDel() != null ? dto.getIsDel() : false);
        return studySet;
    }
}
