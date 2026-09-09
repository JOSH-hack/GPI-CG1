package com.golfe1.gpi.repositories;

import com.golfe1.gpi.entities.LogSysteme;
import com.golfe1.gpi.entities.enums.NiveauLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogSystemeRepository extends JpaRepository<LogSysteme, Long> {
    Page<LogSysteme> findByNiveauOrderByDateLogDesc(NiveauLog niveau, Pageable pageable);

    Page<LogSysteme> findAllByOrderByDateLogDesc(Pageable pageable);
}