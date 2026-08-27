package quizlet.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import quizlet.backend.dto.FolderDTO;
import quizlet.backend.dto.SchoolClassDTO;
import quizlet.backend.dto.StudySetDTO;
import quizlet.backend.dto.UserDTO;
import quizlet.backend.enums.Role;
import quizlet.backend.model.Folder;
import quizlet.backend.model.SchoolClass;
import quizlet.backend.model.StudySet;
import quizlet.backend.model.User;
import quizlet.backend.repository.FolderRepository;
import quizlet.backend.repository.SchoolClassRepository;
import quizlet.backend.repository.StudySetRepository;
import quizlet.backend.repository.UserRepository;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchoolClassService {

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudySetRepository studySetRepository;

    @Autowired
    private FolderRepository folderRepository;

    // 1. Giáo viên tạo lớp học mới
    public SchoolClassDTO createClass(User teacher, SchoolClassDTO dto) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(dto.getName());
        schoolClass.setDescription(dto.getDescription());
        schoolClass.setJoinCode("CLASS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        schoolClass.setTeacher(teacher);
        schoolClass.getStudents().add(teacher);

        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return convertToDTO(saved);
    }

    // 2. Giáo viên sửa lớp học
    public SchoolClassDTO updateClass(User teacher, Long classId, SchoolClassDTO dto) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        if (!schoolClass.getTeacher().getId().equals(teacher.getId()) ) {
            throw new RuntimeException("Chỉ giáo viên tạo lớp mới có quyền chỉnh sửa");
        }

        if (dto.getName() != null) schoolClass.setName(dto.getName());
        if (dto.getDescription() != null) schoolClass.setDescription(dto.getDescription());

        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return convertToDTO(saved);
    }

    // 3. Giáo viên xóa mềm lớp học
    public void deleteClass(User teacher, Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        if (!schoolClass.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Chỉ giáo viên tạo lớp mới có quyền xóa");
        }

        schoolClass.setIsDel(true);
        schoolClassRepository.save(schoolClass);
    }

    // 4. Giáo viên thêm Bộ từ vựng vào lớp
    public SchoolClassDTO addStudySetToClass(User teacher, Long classId, Long studySetId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        StudySet studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bộ từ vựng"));

        schoolClass.getStudySets().add(studySet);
        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return convertToDTO(saved);
    }

    // 5. Giáo viên thêm Thư mục vào lớp
    public SchoolClassDTO addFolderToClass(User teacher, Long classId, Long folderId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thư mục"));

        schoolClass.getFolders().add(folder);
        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return convertToDTO(saved);
    }

    // 6. Sinh viên tham gia lớp học bằng mã/đường link (joinCode)
    public SchoolClassDTO joinClassByCode(User student, String joinCode) {
        SchoolClass schoolClass = schoolClassRepository.findByJoinCodeAndIsDelFalse(joinCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã tham gia lớp học không hợp lệ hoặc đã hết hạn"));

        schoolClass.getStudents().add(student);
        SchoolClass saved = schoolClassRepository.save(schoolClass);
        return convertToDTO(saved);
    }

    // 7. Lấy danh sách lớp học của user (Giáo viên quản lý hoặc Sinh viên tham gia)
    public List<SchoolClassDTO> getUserClasses(User user) {
        List<SchoolClass> classes;
        if (user.getRole() == Role.TEACHER) {
            classes = schoolClassRepository.findByTeacherIdAndIsDelFalse(user.getId());
        } else {
            classes = schoolClassRepository.findByStudents_IdAndIsDelFalse(user.getId());
        }
        return classes.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 8. Lấy chi tiết lớp học theo ID
    public SchoolClassDTO getClassById(Long classId) {
        SchoolClass c = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
        return convertToDTO(c);
    }

    private SchoolClassDTO convertToDTO(SchoolClass c) {
        SchoolClassDTO dto = new SchoolClassDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setJoinCode(c.getJoinCode());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setTeacherId(c.getTeacher().getId());
        dto.setTeacherName(c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName());
        dto.setTeacherEmail(c.getTeacher().getEmail());
        dto.setStudentsCount(c.getStudents() != null ? c.getStudents().size() : 0);
        dto.setSetsCount(c.getStudySets() != null ? c.getStudySets().size() : 0);
        dto.setFoldersCount(c.getFolders() != null ? c.getFolders().size() : 0);

        if (c.getStudents() != null) {
            dto.setStudents(c.getStudents().stream().map(u -> {
                UserDTO udto = new UserDTO();
                udto.setId(u.getId());
                udto.setFirstName(u.getFirstName());
                udto.setLastName(u.getLastName());
                udto.setEmail(u.getEmail());
                udto.setRole(u.getRole());
                return udto;
            }).collect(Collectors.toList()));
        }

        if (c.getFolders() != null) {
            dto.setFolders(c.getFolders().stream().map(f -> {
                FolderDTO fdto = new FolderDTO();
                fdto.setId(f.getId());
                fdto.setName(f.getName());
                fdto.setDescription(f.getDescription());
                fdto.setIcon(f.getIcon());
                fdto.setSlug(f.getSlug());
                fdto.setSetsCount(f.getStudySets() != null ? f.getStudySets().size() : 0);
                return fdto;
            }).collect(Collectors.toList()));
        }

        if (c.getStudySets() != null) {
            dto.setStudySets(c.getStudySets().stream().map(s -> {
                StudySetDTO sdto = new StudySetDTO();
                sdto.setId(s.getId());
                sdto.setTitleName(s.getTitleName());
                sdto.setDescription(s.getDescription());
                sdto.setSlug(s.getSlug());
                if (s.getFolder() != null) {
                    sdto.setFolderSlug(s.getFolder().getSlug());
                }
                return sdto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
