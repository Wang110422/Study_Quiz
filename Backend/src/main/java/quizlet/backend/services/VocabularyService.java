package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.VocabularyFlashCardDTO;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.Vocabulary;
import quizlet.backend.repository.StudySetRepository;
import quizlet.backend.repository.VocabularyRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VocabularyService {
    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    public List<VocabularyFlashCardDTO> getVocabulary(String slug) {
        return vocabularyRepository.findByStudySetSlug(slug)
                .stream()
                .map(x -> {
                    VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
                    c.setTerm(x.getTerm());
                    c.setDefinition(x.getDefinition());
                    return c;
                })
                .collect(Collectors.toList());
    }
    public List<VocabularyFlashCardDTO> createVocabulary(String slug,List<VocabularyFlashCardDTO> requestDTO) {
        StudySet studySet = studySetRepository.findBySlug(slug);
        List<Vocabulary> vocabularies = requestDTO
                .stream()
                .map(x->{
                    Vocabulary v = new Vocabulary();
                    v.setTerm(x.getTerm());
                    v.setDefinition(x.getDefinition());
                    v.setStudySet(studySet);
                    return v;
                }).toList();
        List<Vocabulary> savedEntries =  vocabularyRepository.saveAll(vocabularies);
        return savedEntries
                .stream()
                .map(v ->{
                    VocabularyFlashCardDTO c = new VocabularyFlashCardDTO();
                    c.setTerm(v.getTerm());
                    c.setDefinition(v.getDefinition());
                    return c;
                })
                .toList();
    }

}
