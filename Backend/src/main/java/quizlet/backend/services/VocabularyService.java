package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.model.Folder;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.Vocabulary;
import quizlet.backend.repository.FolderRepository;
import quizlet.backend.repository.StudySetRepository;
import quizlet.backend.repository.VocabularyRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VocabularyService {
    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private FolderRepository folderRepository;

    public VocabularyFlashCardDTO convertToDTO(Vocabulary x) {
        VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
        c.setId(x.getId());
        c.setTerm(x.getTerm());
        c.setDefinition(x.getDefinition());
        c.setBaseForm(x.getBaseForm());
        c.setIpa(x.getIpa());
        c.setAudioUrl(x.getAudioUrl());
        c.setPos(x.getPos());
        c.setLevel(x.getLevel());
        c.setMeaning(x.getMeaning());
        c.setHint(x.getHint());
        c.setCreateAt(x.getCreateAt());
        c.setIsDel(x.getIsDel());
        return c;
    }

    public List<VocabularyFlashCardDTO> getVocabulary(String slug) {
        return vocabularyRepository.findByStudySetSlug(slug)
                .stream()
                .filter(x -> x.getIsDel() == null || !x.getIsDel())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VocabularyFlashCardDTO> getDeletedByUserId(Long userId) {
        return vocabularyRepository.findByStudySetFolderUserIdAndIsDelTrue(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public boolean softDeleteVocabulary(Long id) {
        Vocabulary v = vocabularyRepository.findById(id).orElse(null);
        if (v != null) {
            v.setIsDel(true);
            vocabularyRepository.save(v);
            return true;
        }
        return false;
    }

    public boolean restoreVocabulary(Long id) {
        Vocabulary v = vocabularyRepository.findById(id).orElse(null);
        if (v != null) {
            v.setIsDel(false);
            vocabularyRepository.save(v);
            return true;
        }
        return false;
    }

    public boolean permanentDeleteVocabulary(Long id) {
        if (vocabularyRepository.existsById(id)) {
            vocabularyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<VocabularyFlashCardDTO> createVocabulary(String slug, List<VocabularyFlashCardDTO> requestDTO) {
        StudySet studySet = studySetRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceAccessException("Studyset not found"));
        List<Vocabulary> vocabularies = requestDTO
                .stream()
                .map(x -> {
                    Vocabulary v = new Vocabulary();
                    v.setTerm(x.getTerm());
                    v.setDefinition(x.getDefinition());
                    v.setIsDel(false);
                    v.setStudySet(studySet);
                    return v;
                }).collect(Collectors.toList());
        List<Vocabulary> savedEntries = vocabularyRepository.saveAll(vocabularies);
        return savedEntries
                .stream()
                .map(v -> {
                    VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
                    c.setId(v.getId());
                    c.setTerm(v.getTerm());
                    c.setDefinition(v.getDefinition());
                    c.setIsDel(v.getIsDel());
                    c.setDefinition(v.getDefinition());
                    return c;
                })
                .collect(Collectors.toList());
    }

    public Map<String, List<VocabularyFlashCardDTO>> getVocabularyByFolderID(Long folderId) {
        Map<String, List<VocabularyFlashCardDTO>> map = new HashMap<>();
        List<StudySet> studySets = studySetRepository.findByFolderId(folderId);
        for (StudySet studySet : studySets) {
            List<VocabularyFlashCardDTO> vocabularies = vocabularyRepository.findByStudySetSlug(studySet.getSlug())
                    .stream().map(vocabulary -> {
                        VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
                        c.setTerm(vocabulary.getTerm());
                        c.setDefinition(vocabulary.getDefinition());
                        return c;
                    })
                    .collect(Collectors.toList());
            map.put(studySet.getTitleName(), vocabularies);
        }
        return map;
    }

    public Map<String, List<VocabularyFlashCardDTO>> getVocabularyByUserID(Long userId) {
        Map<String, List<VocabularyFlashCardDTO>> map = new HashMap<>();
        List<Folder> folders = folderRepository.findByUserId(userId);
        for (Folder folder : folders) {
            List<StudySet> studySets = studySetRepository.findByFolderId(folder.getId());
            for (StudySet studySet : studySets) {
                List<VocabularyFlashCardDTO> vocabularies = vocabularyRepository.findByStudySetSlug(studySet.getSlug())
                        .stream().map(vocabulary -> {
                            VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
                            c.setTerm(vocabulary.getTerm());
                            c.setDefinition(vocabulary.getDefinition());
                            return c;
                        })
                        .collect(Collectors.toList());
                map.put(studySet.getTitleName(), vocabularies);
            }
        }
        return map;
    }
}
