import api from "./api";

// ========================================
// GET FOLLOW-UPS FOR LEAD
// ========================================

export const getLeadFollowUpsApi =
  async (leadId) => {
    const response =
      await api.get(
        `/leads/${leadId}/timeline`
      );

    const timeline =
      response?.data?.data?.timeline ??
      response?.data?.timeline ??
      [];

    if (!Array.isArray(timeline)) {
      return [];
    }

    return timeline
      .filter((event) => event.type === "FOLLOW_UP")
      .map((event) => ({
        id: event.id,
        leadId: event.leadId,
        createdAt: event.createdAt,
        followUpDate: event.metadata?.followUpDate,
        followUpTime: event.metadata?.followUpTime,
        status: event.metadata?.status,
        notes:
          event.description === "No notes"
            ? ""
            : event.description,
        scheduledBy: event.actor,
      }));
  };

// ========================================
// CREATE FOLLOW-UP
// ========================================

export const createFollowUpApi =
  async (leadId, payload = {}) => {
    const rawDateTime =
      payload.followUpDate;

    const normalizedPayload = {
      ...payload,
    };

    if (
      rawDateTime &&
      rawDateTime.includes("T")
    ) {
      const [date, time] =
        rawDateTime.split("T");

      normalizedPayload.followUpDate =
        date;
      normalizedPayload.followUpTime =
        time?.slice(0, 5) || "";
    }

    if (
      !normalizedPayload.followUpTime &&
      rawDateTime &&
      !rawDateTime.includes("T")
    ) {
      normalizedPayload.followUpTime =
        "09:00";
    }

    const response =
      await api.post(
        `/followups/${leadId}`,
        normalizedPayload
      );

    return response.data;
  };

// ========================================
// UPDATE FOLLOW-UP
// ========================================

export const updateFollowUpApi =
  async (followUpId, payload) => {
    const response =
      await api.patch(
        `/followups/${followUpId}`,
        payload
      );

    return response.data;
  };