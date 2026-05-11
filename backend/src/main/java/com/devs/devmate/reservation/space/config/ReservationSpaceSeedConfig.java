package com.devs.devmate.reservation.space.config;


import com.devs.devmate.reservation.space.entity.ReservationSpace;
import com.devs.devmate.reservation.space.entity.ReservationSpaceProvider;
import com.devs.devmate.reservation.space.entity.ReservationSpaceType;
import com.devs.devmate.reservation.space.repository.ReservationSpaceRepository;
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
                reservationSpaceRepository.save(
                        ReservationSpace.builder()
                                .name("DevMine A룸")
                                .providerType(ReservationSpaceType.INTERNAL)
                                .providerName(ReservationSpaceProvider.INTERNAL)
                                .build());
                reservationSpaceRepository.save(
                        ReservationSpace.builder()
                                .name("DevMine B룸")
                                .providerType(ReservationSpaceType.INTERNAL)
                                .providerName(ReservationSpaceProvider.INTERNAL)
                                .build());
                reservationSpaceRepository.save(
                        ReservationSpace.builder()
                                .name("DevMine C룸")
                                .providerType(ReservationSpaceType.INTERNAL)
                                .providerName(ReservationSpaceProvider.INTERNAL)
                                .build());
                reservationSpaceRepository.save(
                        ReservationSpace.builder()
                                .name("DevMine D룸")
                                .providerType(ReservationSpaceType.INTERNAL)
                                .providerName(ReservationSpaceProvider.INTERNAL)
                                .build());
                reservationSpaceRepository.save(
                        ReservationSpace.builder()
                                .name("DevMine E룸")
                                .providerType(ReservationSpaceType.INTERNAL)
                                .providerName(ReservationSpaceProvider.INTERNAL)
                                .build());
            }
        };
    }

}
