// This array holds the UIDs of users who have admin privileges.
export const ADMIN_UIDS = process.env.NEXT_PUBLIC_ADMIN_UIDS 
  ? process.env.NEXT_PUBLIC_ADMIN_UIDS.split(',') 
  : [];