"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  const role = data.user?.user_metadata?.role;
  const status = data.user?.app_metadata?.status || data.user?.user_metadata?.status || "pending";

  if (role === "admin") {
    return { redirect: "/admin" };
  }
  if (status !== "approved") {
    return { redirect: "/pendente" };
  }
  return { redirect: "/painel" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUpShipper(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const phone = formData.get("phone") as string;

  if (password !== confirmPassword) {
    return { errors: { confirmPassword: "As senhas nao coincidem." } };
  }

  if (password.length < 6) {
    return { errors: { password: "A senha deve ter pelo menos 6 caracteres." } };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "shipper",
        status: "pending",
      },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
      return { error: "Este e-mail ja esta cadastrado." };
    }
    if (authError.message.includes("rate limit") || authError.message.includes("too many")) {
      return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  if (!authData.user) {
    return { error: "Erro ao criar conta." };
  }

  // Create profile via admin client (bypasses RLS)
  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    role: "shipper",
    status: "pending",
    email,
    phone: phone || null,
  });

  if (profileError) {
    console.error("Profile creation error:", profileError);
  }

  // Create shipper profile
  const { error: shipperError } = await admin.from("shipper_profiles").insert({
    id: authData.user.id,
    cnpj: (formData.get("cnpj") as string)?.replace(/\D/g, ""),
    razao_social: formData.get("razao_social") as string,
    endereco_cep: (formData.get("endereco_cep") as string)?.replace(/\D/g, ""),
    endereco_logradouro: formData.get("endereco_logradouro") as string,
    endereco_numero: formData.get("endereco_numero") as string,
    endereco_complemento: (formData.get("endereco_complemento") as string) || null,
    endereco_bairro: formData.get("endereco_bairro") as string,
    endereco_cidade: formData.get("endereco_cidade") as string,
    endereco_uf: formData.get("endereco_uf") as string,
    responsavel_nome: formData.get("responsavel_nome") as string,
    responsavel_cargo: (formData.get("responsavel_cargo") as string) || null,
    natureza_cargas: formData.get("natureza_cargas") as string,
    valor_medio_carga: parseFloat(formData.get("valor_medio_carga") as string) || 0,
  });

  if (shipperError) {
    console.error("Shipper profile creation error:", shipperError);
    return { error: "Erro ao salvar dados da empresa." };
  }

  return { success: true };
}

export async function signUpCarrier(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const phone = formData.get("phone") as string;
  const personType = formData.get("person_type") as "pf" | "pj";

  if (password !== confirmPassword) {
    return { errors: { confirmPassword: "As senhas nao coincidem." } };
  }

  if (password.length < 6) {
    return { errors: { password: "A senha deve ter pelo menos 6 caracteres." } };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "carrier",
        status: "pending",
      },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("already been registered")) {
      return { error: "Este e-mail ja esta cadastrado." };
    }
    if (authError.message.includes("rate limit") || authError.message.includes("too many")) {
      return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  if (!authData.user) {
    return { error: "Erro ao criar conta." };
  }

  const userId = authData.user.id;

  // Create profile
  await admin.from("profiles").insert({
    id: userId,
    role: "carrier",
    status: "pending",
    email,
    phone: phone || null,
  });

  // Upload CNH document
  let cnhDocUrl: string | null = null;
  const cnhFiles = formData.getAll("cnh_files") as File[];
  if (cnhFiles.length > 0 && cnhFiles[0].size > 0) {
    const file = cnhFiles[0];
    const ext = file.name.split(".").pop();
    const path = `${userId}/cnh.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("cnh-documents")
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      cnhDocUrl = path;
    }
  }

  // Create carrier profile
  await admin.from("carrier_profiles").insert({
    id: userId,
    person_type: personType,
    cpf: personType === "pf" ? (formData.get("cpf") as string)?.replace(/\D/g, "") : null,
    nome_completo: personType === "pf" ? (formData.get("nome_completo") as string) : null,
    cnpj: personType === "pj" ? (formData.get("cnpj") as string)?.replace(/\D/g, "") : null,
    razao_social: personType === "pj" ? (formData.get("razao_social") as string) : null,
    cnh_numero: formData.get("cnh_numero") as string,
    cnh_categoria: formData.get("cnh_categoria") as string,
    cnh_validade: formData.get("cnh_validade") as string,
    cnh_documento_url: cnhDocUrl,
    seguro_apolice: formData.get("seguro_apolice") as string,
    seguro_seguradora: formData.get("seguro_seguradora") as string,
  });

  // Create vehicle
  const { data: vehicleData } = await admin.from("vehicles").insert({
    carrier_id: userId,
    marca: formData.get("marca") as string,
    modelo: formData.get("modelo") as string,
    ano: parseInt(formData.get("ano") as string),
    placa: (formData.get("placa") as string)?.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    renavam: formData.get("renavam") as string,
  }).select("id").single();

  // Create implement
  if (vehicleData) {
    const { data: implementData } = await admin.from("implements").insert({
      vehicle_id: vehicleData.id,
      tipo: formData.get("implemento_tipo") as string,
      capacidade_kg: parseFloat(formData.get("implemento_capacidade") as string) || 0,
      comprimento_m: parseFloat(formData.get("implemento_comprimento") as string) || 0,
      largura_m: parseFloat(formData.get("implemento_largura") as string) || 0,
      altura_m: parseFloat(formData.get("implemento_altura") as string) || 0,
    }).select("id").single();

    // Upload implement photos
    if (implementData) {
      const photos = formData.getAll("implement_photos") as File[];
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.size > 0) {
          const ext = photo.name.split(".").pop();
          const path = `${userId}/${implementData.id}/${i}.${ext}`;
          const { error: uploadError } = await admin.storage
            .from("implement-photos")
            .upload(path, photo, { upsert: true });
          if (!uploadError) {
            await admin.from("implement_photos").insert({
              implement_id: implementData.id,
              photo_url: path,
              sort_order: i,
            });
          }
        }
      }
    }
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) {
    return { error: "Erro ao enviar e-mail de recuperacao." };
  }

  return { success: true };
}
