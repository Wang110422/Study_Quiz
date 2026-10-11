import api from '../config/api';

export interface LeaderboardItemDTO {
    userId: number;
    name: string;
    email: string;
    avatarUrl?: string;
    avatarInitial: string;
    isCurrentUser?: boolean;
    rank?: number;

    // Metric 1: Từ vựng
    vocabLearned: number;
    studySetsCount: number;

    // Metric 2: Luyện đề (3 tiêu chí)
    examsSubmitted: number;
    latestExamScore: number;
    avgExamScore: number;
    lastExamDate?: string;

    // Metric 3: Streak
    streakDays: number;
    totalActiveDays: number;
    lastActiveDate?: string;

    // Metric 4: EXP / Điểm cống hiến
    expPoints?: number;
}

export interface UserStreakDTO {
    id?: number;
    userId: number;
    userName: string;
    avatarUrl?: string;
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    vocabLearned: number;
    lastActivityDate?: string;
    hasActiveToday: boolean;
    attendanceRate: number;
    weeklyActivity: boolean[];
    activeDatesInMonth?: string[];
}

export interface StreakMilestoneDTO {
    targetDays: number;
    title: string;
    badgeName: string;
    achieved: boolean;
    progressPercent: number;
}

export interface MyRankResponseDTO {
    myRank?: LeaderboardItemDTO;
    neighbors: LeaderboardItemDTO[];
    totalParticipants: number;
}

export interface LeaderboardResponseDTO {
    filter: string;
    subFilter: string;
    totalParticipants: number;
    rankings: LeaderboardItemDTO[];
    currentUserRanking?: LeaderboardItemDTO;
    streakSummary?: UserStreakDTO;
}

export const leaderboardService = {
    /**
     * Lấy danh sách bảng xếp hạng theo bộ lọc:
     * @param filter 'vocab' | 'exam' | 'streak' | 'exp'
     * @param subFilter 'submitted' | 'latest_score' | 'avg_score' (áp dụng cho 'exam')
     * @param limit số lượng hiển thị (mặc định 50)
     */
    async getLeaderboard(
        filter: 'vocab' | 'exam' | 'streak' | 'exp' = 'vocab',
        subFilter: 'submitted' | 'latest_score' | 'avg_score' = 'submitted',
        limit: number = 50
    ): Promise<LeaderboardResponseDTO> {
        const response = await api.get('/leaderboard', {
            params: { filter, subFilter, limit },
        });
        return response.data?.result || response.data;
    },

    /**
     * Lấy Top 3 thí sinh bục vinh danh (Vàng, Bạc, Đồng)
     */
    async getTopPodium(
        filter: 'vocab' | 'exam' | 'streak' | 'exp' = 'vocab',
        subFilter: 'submitted' | 'latest_score' | 'avg_score' = 'submitted'
    ): Promise<LeaderboardItemDTO[]> {
        const response = await api.get('/leaderboard/podium', {
            params: { filter, subFilter },
        });
        return response.data?.result || response.data || [];
    },

    /**
     * Lấy thứ hạng của tôi kèm đối thủ liền kề (±2 thứ hạng)
     */
    async getMyRankAndNeighbors(
        filter: 'vocab' | 'exam' | 'streak' | 'exp' = 'vocab',
        subFilter: 'submitted' | 'latest_score' | 'avg_score' = 'submitted'
    ): Promise<MyRankResponseDTO> {
        const response = await api.get('/leaderboard/my-rank', {
            params: { filter, subFilter },
        });
        return response.data?.result || response.data;
    },

    /**
     * Lấy bảng xếp hạng nội bộ của Lớp học
     */
    async getClassLeaderboard(
        classId: number | string,
        filter: 'vocab' | 'exam' | 'streak' | 'exp' = 'vocab',
        subFilter: 'submitted' | 'latest_score' | 'avg_score' = 'submitted'
    ): Promise<LeaderboardResponseDTO> {
        const response = await api.get(`/leaderboard/class/${classId}`, {
            params: { filter, subFilter },
        });
        return response.data?.result || response.data;
    },

    /**
     * Lấy bảng xếp hạng nội bộ của Nhóm học
     */
    async getGroupLeaderboard(
        groupId: number | string,
        filter: 'vocab' | 'exam' | 'streak' | 'exp' = 'vocab',
        subFilter: 'submitted' | 'latest_score' | 'avg_score' = 'submitted'
    ): Promise<LeaderboardResponseDTO> {
        const response = await api.get(`/leaderboard/group/${groupId}`, {
            params: { filter, subFilter },
        });
        return response.data?.result || response.data;
    },

    /**
     * Lấy thông tin Streak cá nhân của người dùng hiện tại
     */
    async getMyStreak(): Promise<UserStreakDTO> {
        const response = await api.get('/streak/me');
        return response.data?.result || response.data;
    },

    /**
     * Lấy thông tin Streak công khai của một học viên bất kỳ
     */
    async getUserStreak(userId: number | string): Promise<UserStreakDTO> {
        const response = await api.get(`/streak/user/${userId}`);
        return response.data?.result || response.data;
    },

    /**
     * Ghi nhận hoạt động học tập hôm nay (tự động kích hoạt/tăng streak)
     */
    async recordStreakActivity(): Promise<UserStreakDTO> {
        const response = await api.post('/streak/record');
        return response.data?.result || response.data;
    },

    /**
     * Cập nhật tiến độ học thuộc từ vựng
     */
    async updateVocabProgress(count: number = 1, isIncrement: boolean = true): Promise<UserStreakDTO> {
        const response = await api.post('/streak/vocab-progress', {
            count,
            isIncrement,
        });
        return response.data?.result || response.data;
    },

    /**
     * Lấy danh sách cột mốc và huy hiệu streak
     */
    async getStreakMilestones(): Promise<StreakMilestoneDTO[]> {
        const response = await api.get('/streak/milestones');
        return response.data?.result || response.data || [];
    },
};

export default leaderboardService;
