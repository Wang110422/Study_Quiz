package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.helper.SlugUtil;
import quizlet.backend.model.Folder;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.User;
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

    public List<StudySetDTO> getAllByUserId(Long userId) {
        return studySetRepository.findAllByUserIdIncludingIndependent(userId)
                .stream()
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

    public StudySetDTO createStudySet(StudySetDTO studySetDTO, User user) {
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
        studySet.setUser(user != null ? user : (folder != null ? folder.getUser() : null));
        studySet.setIsDel(false);

        if (studySetDTO.getVocabularies() != null && !studySetDTO.getVocabularies().isEmpty()) {
            List<Vocabulary> vocabularies = studySetDTO.getVocabularies().stream().map(vDto -> {
                Vocabulary v = new Vocabulary();
                v.setTerm(vDto.getTerm());
                v.setDefinition(vDto.getDefinition());
                v.setBaseForm(vDto.getBaseForm());
                v.setIpa(vDto.getIpa());
                v.setAudioUrl(vDto.getAudioUrl());
                v.setPos(vDto.getPos());
                v.setLevel(vDto.getLevel());
                v.setMeaning(vDto.getMeaning() != null ? vDto.getMeaning() : vDto.getDefinition());
                v.setHint(vDto.getHint());
                v.setCreateAt(vDto.getCreateAt() != null ? vDto.getCreateAt() : java.time.LocalDateTime.now());
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
        dto.setCreatedAt(studySet.getCreatedAt());

        if (studySet.getUser() != null) {
            dto.setUserId(studySet.getUser().getId());
            String fullName = (studySet.getUser().getFirstName() != null ? studySet.getUser().getFirstName() : "") + " " +
                    (studySet.getUser().getLastName() != null ? studySet.getUser().getLastName() : "");
            dto.setAuthorName(fullName.trim().isEmpty() ? studySet.getUser().getEmail() : fullName.trim());
        } else {
            dto.setAuthorName("Hệ thống");
        }

        if (studySet.getFolder() != null) {
            dto.setFolderId(studySet.getFolder().getId());
            dto.setFolderSlug(studySet.getFolder().getSlug());
            dto.setFolderName(studySet.getFolder().getName());
        }

        if (studySet.getVocabularies() != null) {
            dto.setVocabulariesCount(studySet.getVocabularies().size());
            dto.setVocabularies(studySet.getVocabularies().stream().map(v -> {
                VocabularyFlashCardDTO vDto = new VocabularyFlashCardDTO();
                vDto.setId(v.getId());
                vDto.setTerm(v.getTerm());
                vDto.setDefinition(v.getDefinition());
                vDto.setBaseForm(v.getBaseForm());
                vDto.setIpa(v.getIpa());
                vDto.setAudioUrl(v.getAudioUrl());
                vDto.setPos(v.getPos());
                vDto.setLevel(v.getLevel());
                vDto.setMeaning(v.getMeaning());
                vDto.setHint(v.getHint());
                vDto.setCreateAt(v.getCreateAt());
                vDto.setIsDel(v.getIsDel());
                vDto.setStudySetId(studySet.getId());
                return vDto;
            }).collect(Collectors.toList()));
        } else {
            dto.setVocabulariesCount(0);
            dto.setVocabularies(new ArrayList<>());
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
