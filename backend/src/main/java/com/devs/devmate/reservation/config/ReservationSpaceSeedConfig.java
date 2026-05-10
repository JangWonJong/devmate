package com.devs.devmate.reservation.config;


import com.devs.devmate.reservation.entity.ReservationSpace;
import com.devs.devmate.reservation.entity.ReservationSpaceType;
import com.devs.devmate.reservation.repository.ReservationSpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ReservationSpaceSeedConfig {

    private final ReservationSpaceRepository reservationSpaceRepository;

    @Bean
    CommandLineRunner seeReservationSpaces() {
        return args -> {
            if (reservationSpaceRepository.count() == 0) {
                reservationSpaceRepository.save(ReservationSpace.builder().name("DevMine A룸").providerType(ReservationSpaceType.INTERNAL).build());
                reservationSpaceRepository.save(ReservationSpace.builder().name("DevMine B룸").providerType(ReservationSpaceType.INTERNAL).build());
                reservationSpaceRepository.save(ReservationSpace.builder().name("DevMine C룸").providerType(ReservationSpaceType.INTERNAL).build());
                reservationSpaceRepository.save(ReservationSpace.builder().name("DevMine D룸").providerType(ReservationSpaceType.INTERNAL).build());
                reservationSpaceRepository.save(ReservationSpace.builder().name("DevMine E룸").providerType(ReservationSpaceType.INTERNAL).build());
            }
        };
    }

}
