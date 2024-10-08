import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { Alert } from "react-native";
import { OrganizationProfile, PersonalProfile } from "./types";

const supabaseUrl = "https://egaxbxzsvwoeyjjcnnrn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYXhieHpzdndvZXlqamNubnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1NTI1NzcsImV4cCI6MjA0MzEyODU3N30._IKpp8BPqkCLLS5VqxRhwUbi-V3oC6wJFTuHRbTU3Ao";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const checkIdType = async (id: string) => {
  // 1: personal, 0: organization
  try {
    const { data, error } = await supabase
      .from("personal")
      .select("*")
      .eq("personal_id", id);
    if (error) {
      console.error("error checking session type", error);
      return false;
    }
    if (data && data.length > 0) {
      console.log("session is personal");
      return true;
    } else {
      console.log("session is organizational", id);
      return false;
    }
  } catch (e) {
    console.error("error checking session type, personal or org", e);
  }
};

export const personalSignUp = async (
  email,
  password,
  first_name,
  last_name
) => {
  try {
    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: first_name,
          last_name: last_name,
          user_type: "personal",
        },
      },
    });
    if (error) {
      console.error("error signing up personal fetch", error);
    } else {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
};

export const organizationSignUp = async (
  email,
  passsword,
  org_name,
  website
) => {
  try {
    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: passsword,
      options: {
        data: {
          org_name: org_name,
          website: website,
          user_type: "organization",
        },
      },
    });
    if (error) {
      console.error("error signing up organization fetch", error);
    } else {
      return true;
    }
  } catch (e) {
    console.error("error signing up organization", e);
  }
};

export const login = async (email, password) => {
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error("error login fetch", error);
    } else {
      return true;
    }
  } catch (e) {
    console.error("error logging in", e);
  }
};

export const logout = async () => {
  try {
    let { error } = await supabase.auth.signOut();
    if (error) {
      console.error("error signout fetch", error);
    } else {
      return true;
    }
  } catch (e) {
    console.error("error logging out", e);
  }
};

export const getPersonalProfile = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  id: string
) => {
  let profile: PersonalProfile | null = null; // Declare it here
  try {
    console.log(id);
    setLoading(true);

    const { data, error, status } = await supabase
      .from("personal")
      .select(`first_name, last_name, email, synqed, number, citizenship`)
      .eq("personal_id", id)
      .single();

    if (error && status !== 406) {
      throw error;
    }
    if (data) {
      console.log("reached");
      const personalProfile: PersonalProfile = {
        personal_id: id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        number: data.number,
        citizenship: data.citizenship,
        synqed: data.synqed,
      };
      profile = personalProfile;
      console.log("personal profile when created:", personalProfile);
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
  console.log("personal profile before return sttment: ", profile);
  return profile;
};

export const getOrganizationProfile = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  id: string
) => {
  let profile: OrganizationProfile | null = null; // Declare it here
  try {
    setLoading(true);

    const { data, error, status } = await supabase
      .from("organization")
      .select(
        `org_name, website, email, description, first_name, last_name, synqed`
      )
      .eq("organization_id", id)
      .single();

    if (error && status !== 406) {
      throw error;
    }
    if (data) {
      const organizationProfile: OrganizationProfile = {
        organization_id: id,
        org_name: data.org_name,
        first_name: data.first_name,
        last_name: data.last_name,
        website: data.website,
        email: data.email,
        description: data.description,
        synqed: data.synqed,
      };
      profile = organizationProfile;
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
  return profile;
};

export const updatePersonalProfile = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  session: Session,
  updatedProfile: PersonalProfile
) => {
  try {
    setLoading(true);
    if (!session?.user) throw new Error("No user on the session!");

    const { error } = await supabase.from("personal").upsert(updatedProfile);

    if (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};

export const updateOrganizationProfile = async (
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  session: Session,
  updatedProfile: OrganizationProfile
) => {
  try {
    setLoading(true);
    if (!session?.user) throw new Error("No user on the session!");

    const { error } = await supabase
      .from("organization")
      .upsert(updatedProfile);

    if (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};

export const synqPersonalProfile = async ({
  setLoading,
  session,
  accountId,
  userId,
}: {
  setLoading: (loading: boolean) => void;
  session: Session;
  accountId: string; // The ID of the organization to sync with
  userId: string; // The ID of the user syncing
}) => {
  try {
    setLoading(true);
    if (!session?.user) throw new Error("No user on the session!");

    // Fetch the current personal profile
    const { data: profile, error: fetchError } = await supabase
      .from("personal")
      .select("*")
      .eq("personal_id", userId)
      .single();

    if (fetchError || !profile) {
      throw new Error("Error fetching the profile.");
    }

    // Update the synqed list
    const updatedProfile = {
      ...profile,
      synqed: [...(profile.synqed || []), accountId], // Add the new organization to the synqed list
    };

    console.log("about to update supabase");
    console.log(updatedProfile);

    const { error } = await supabase.from("personal").upsert(updatedProfile);

    console.log("successfully updated");

    if (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};

export const synqOrganizationProfile = async ({
  setLoading,
  session,
  accountId,
  userId,
}: {
  setLoading: (loading: boolean) => void;
  session: Session;
  accountId: string; // The ID of the person to sync with
  userId: string; // The ID of the organnization syncing
}) => {
  try {
    console.log("BEGIN SYNQ PROCESS");

    setLoading(true);
    if (!session?.user) throw new Error("No user on the session!");

    console.log("alskjdf");
    // Fetch the current organization profile
    const { data: profile, error: fetchError } = await supabase
      .from("organization")
      .select("*")
      .eq("organization_id", userId)
      .single();

    console.log(fetchError);
    console.log("profile");
    console.log(profile);

    if (fetchError || !profile) {
      throw new Error("Error fetching the profile.");
    }
    console.log("LSDKJF");
    // Update the synqed list
    const updatedProfile = {
      ...profile,
      synqed: [...(profile.synqed || []), accountId], // Add the new person to the synqed list
    };

    console.log("about to update supabase");

    const { error } = await supabase
      .from("organization")
      .upsert(updatedProfile);

    if (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};
