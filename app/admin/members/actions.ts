"use server";

import { redirect } from "next/navigation";
import { getAdminContext } from "@/payload/utilities/getAdminContext";

const takeString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value : "");

const createUploadedProfilePicture = async ({
  file,
  fullName,
  req,
}: {
  file: FormDataEntryValue | null;
  fullName: string;
  req: Awaited<ReturnType<typeof getAdminContext>>["req"];
}) => {
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const media = await req.payload.create({
    collection: "media",
    data: {
      alt: `${fullName || "Member"} profile picture`,
    },
    file: {
      data: buffer,
      mimetype: file.type,
      name: file.name,
      size: file.size,
    },
    req,
  });

  return media.id;
};

export async function markMemberAsRegular(formData: FormData) {
  const memberValue = formData.get("memberId");
  const returnToValue = formData.get("returnTo");
  const memberID = Number(memberValue);
  const returnTo = typeof returnToValue === "string" && returnToValue.startsWith("/admin")
    ? returnToValue
    : "/admin/members/newcomers";

  if (!Number.isFinite(memberID)) {
    redirect(`${returnTo}?updated=invalid`);
  }

  const { req } = await getAdminContext("mark-member-as-regular-action", {
    allowedRoles: ["admin", "staff"],
  });

  await req.payload.update({
    collection: "members",
    data: {
      isNewComer: false,
    },
    id: memberID,
    req,
  });

  redirect(`${returnTo}?updated=regular`);
}

export async function updateMemberDetails(formData: FormData) {
  const memberID = Number(takeString(formData.get("memberId")));

  if (!Number.isFinite(memberID)) {
    redirect("/admin/members?updated=invalid");
  }

  const relationshipOrNull = (key: string) => {
    const value = takeString(formData.get(key)).trim();
    if (!value) {
      return null;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const optionalString = (key: string) => {
    const value = takeString(formData.get(key)).trim();
    return value || null;
  };

  const { req } = await getAdminContext("update-member-details-action", {
    allowedRoles: ["admin", "staff"],
  });
  const profilePicture = await createUploadedProfilePicture({
    file: formData.get("profilePicture"),
    fullName: `${takeString(formData.get("firstName")).trim()} ${takeString(formData.get("lastName")).trim()}`.trim(),
    req,
  });

  await req.payload.update({
    collection: "members",
    data: {
      company: optionalString("company"),
      dateJoined: optionalString("dateJoined"),
      dateOfBirth: optionalString("dateOfBirth"),
      department: relationshipOrNull("department"),
      email: optionalString("email"),
      favoriteVerse: optionalString("favoriteVerse"),
      firstName: takeString(formData.get("firstName")).trim(),
      hobbies: optionalString("hobbies"),
      homeAddress: optionalString("homeAddress"),
      isNewComer: takeString(formData.get("isNewComer")) === "on",
      lastName: takeString(formData.get("lastName")).trim(),
      maritalStatus: optionalString("maritalStatus"),
      middleName: optionalString("middleName"),
      nationality: optionalString("nationality"),
      nickname: optionalString("nickname"),
      occupation: optionalString("occupation"),
      phoneNumber: optionalString("phoneNumber"),
      preferredDepartment: relationshipOrNull("preferredDepartment"),
      role: optionalString("role"),
      skills: optionalString("skills"),
      tribe: optionalString("tribe"),
      whatsappNumber: optionalString("whatsappNumber"),
      facebookHandle: optionalString("facebookHandle"),
      instagramHandle: optionalString("instagramHandle"),
      ...(profilePicture ? { profilePicture } : {}),
      xHandle: optionalString("xHandle"),
    },
    id: memberID,
    req,
  });

  redirect(`/admin/members/${memberID}?updated=1`);
}
