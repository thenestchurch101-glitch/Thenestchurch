"use client";

import { useMemo, useState } from "react";
import styles from "@/app/public-operations.module.css";

type AttendanceState = {
  id?: number;
  present?: boolean | null;
};

type MemberRow = {
  departmentName: string;
  firstName: string;
  fullName: string;
  id: number;
  record?: AttendanceState;
};

export function AttendanceSearch({
  date,
  members,
}: {
  date: string;
  members: MemberRow[];
}) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    if (!trimmed) {
      return [];
    }

    return members.filter((member) =>
      member.fullName.toLowerCase().includes(trimmed) ||
      member.departmentName.toLowerCase().includes(trimmed),
    );
  }, [members, trimmed]);

  return (
    <>
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search members or departments..."
          type="search"
          value={query}
        />
      </div>

      <form action="/api/public-attendance" className={styles.form} method="post">
        <input name="date" type="hidden" value={date} />
        <div className={styles.memberGrid}>
          {!trimmed ? (
            <div className={styles.empty}>Start typing a member name or department to load attendance cards.</div>
          ) : filteredMembers.length === 0 ? (
            <div className={styles.empty}>No members matched the current search.</div>
          ) : (
            filteredMembers.map((member) => (
              <article className={styles.memberCard} key={member.id}>
                <input name="memberIds" type="hidden" value={member.id} />
                <input name={`existing_${member.id}`} type="hidden" value={member.record?.id ?? ""} />
                <div className={styles.memberTop}>
                  <div className={styles.memberIdentity}>
                    <div className={styles.avatar}>{member.firstName.slice(0, 1) || "M"}</div>
                    <div>
                      <span className={styles.memberName}>{member.fullName}</span>
                      <span className={styles.memberMeta}>{member.departmentName}</span>
                    </div>
                  </div>
                  <input
                    className={styles.checkbox}
                    defaultChecked={member.record?.present ?? false}
                    name="presentMembers"
                    type="checkbox"
                    value={member.id}
                  />
                </div>

                <div className={styles.triple}>
                  <div>
                    <label className={styles.fieldLabel}>Status</label>
                    <span className={`${styles.statusPill} ${member.record?.present ? styles.statusPresent : styles.statusMissing}`}>
                      {member.record?.present ? "Present" : "Not marked"}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {filteredMembers.length > 0 ? (
          <div className={styles.actions}>
            <button className={styles.primaryButton} type="submit">
              Save Attendance
            </button>
          </div>
        ) : null}
      </form>
    </>
  );
}
