package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.Sauvegarde;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SauvegardeRepository extends JpaRepository<Sauvegarde, Long> {
    List<Sauvegarde> findAllByOrderByDateSauvegardeDesc();
    Optional<Sauvegarde> findTopByOrderByDateSauvegardeDesc();
}