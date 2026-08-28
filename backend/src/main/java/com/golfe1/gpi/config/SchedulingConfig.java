/*

Nom du fichier   : SchedulingConfig.java
Objectif         : Active le support des tâches planifiées Spring (@Scheduled) pour tout le projet
Propriétaire     : Josué BEDEL
Date de création : 26/08/2026

*/

package com.golfe1.gpi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
}