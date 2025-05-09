import { PokemonInfo, Team } from "@/types/pokemon";
import { useEffect, useState } from "react";

export const useTeamStorage = (teamId: string) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [pokemonSelected, setPokemonSelected] = useState<PokemonInfo | null>(
    null
  );

  useEffect(() => {
    const stored = localStorage.getItem("teams");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const teams: Team[] = parsed.teams || [];
        const foundTeam = teams.find((t) => t.id === teamId) || null;
        setTeam(foundTeam);
      } catch (e) {
        console.error("Erro ao ler times:", e);
        setTeam(null);
      }
    }
  }, [teamId]);

  const updateTeam = (updater: (prev: Team) => Team) => {
    const stored = localStorage.getItem("teams");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const teams: Team[] = parsed.teams || [];

      const index = teams.findIndex((t) => t.id === teamId);
      if (index === -1) return;

      const updatedTeam = updater(teams[index]);
      teams[index] = updatedTeam;

      localStorage.setItem("teams", JSON.stringify({ teams }));
      setTeam(updatedTeam);
    } catch (e) {
      console.error("Erro ao atualizar time:", e);
    }
  };

  const saveTeam = (updatedTeam: Team) => {
    const stored = localStorage.getItem("teams");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const teams: Team[] = parsed.teams || [];

      const index = teams.findIndex((t) => t.id === teamId);
      if (index === -1) return;

      teams[index] = updatedTeam;
      localStorage.setItem("teams", JSON.stringify({ teams }));
      setTeam(updatedTeam);
    } catch (e) {
      console.error("Erro ao salvar time:", e);
    }
  };

  const addMember = (newMember: PokemonInfo) => {
    if (!team || team.members.length >= 6) return;

    const updatedMembers = [...team.members, newMember].map(
      (member, index) => ({
        ...member,
        indexTeam: index,
      })
    );
    const updated = {
      ...team,
      members: updatedMembers,
    };
    saveTeam(updated);
  };

  const updateMember = (
    index: number,
    updater: (prev: PokemonInfo) => PokemonInfo
  ) => {
    if (!team || index < 0 || index >= team.members.length) return;
    const updatedMembers = [...team.members];
    const prevMember = updatedMembers[index];
    if (!prevMember) return;

    const updatedMember = updater(prevMember);
    updatedMembers[index] = updatedMember;

    const membersWithIndex = updatedMembers.map((member, i) => ({
      ...member,
      indexTeam: i,
    }));

    const updated = {
      ...team,
      members: membersWithIndex,
    };

    saveTeam(updated);

    if (pokemonSelected && pokemonSelected.name === prevMember.name) {
      setPokemonSelected(updatedMember);
    }

    if (pokemonSelected && pokemonSelected.name === prevMember.name) {
      const newSelected = membersWithIndex.find(
        (m) => m.name === pokemonSelected.name
      );
      setPokemonSelected(newSelected || null);
    }
  };

  const removeMember = (index: number) => {
    if (!team || index < 0 || index >= team.members.length) return;
    const updatedMembers = team.members
      .filter((_, i) => i !== index)
      .map((member, i) => ({
        ...member,
        indexTeam: i,
      }));

    const updated = {
      ...team,
      members: updatedMembers,
    };
    saveTeam(updated);

    if (pokemonSelected?.indexTeam === index) {
      setPokemonSelected(updatedMembers[0] || null);
    } else if (pokemonSelected) {
      const newSelected = updatedMembers.find(
        (m) => m.name === pokemonSelected.name
      );
      setPokemonSelected(newSelected || null);
    }
  };

  const getMember = (index: number): PokemonInfo | undefined => {
    if (!team || index < 0 || index >= team.members.length) return undefined;
    return team.members[index];
  };

  return {
    team,
    updateTeam,
    addMember,
    updateMember,
    removeMember,
    getMember,
    pokemonSelected,
    setPokemonSelected,
  };
};
