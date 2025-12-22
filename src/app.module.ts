import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { GamesModule } from './modules/games/games.module';
import { GamePlayersModule } from './modules/game-players/game-players.module';
import { ScenesModule } from './modules/scenes/scenes.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { GameSnapshotsModule } from './modules/game-snapshots/game-snapshots.module';
import { GameLogsModule } from './modules/game-logs/game-logs.module';
import { CombatsModule } from './modules/combats/combats.module';
import { CombatParticipantsModule } from './modules/combat-participants/combat-participants.module';
import { CharactersModule } from './modules/characters/characters.module';
import { MonstersModule } from './modules/monsters/monsters.module';
import { ActorsInGameModule } from './modules/actors-in-game/actors-in-game.module';
import { ClassesModule } from './modules/classes/classes.module';
import { RacesModule } from './modules/races/races.module';
import { BackgroundsModule } from './modules/backgrounds/backgrounds.module';
import { SpellsModule } from './modules/spells/spells.module';
import { ItemsModule } from './modules/items/items.module'; 
import { ConditionsModule } from './modules/conditions/conditions.module';
import { GameGateway } from './modules/realtime/game.gateway';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { SupabaseModule } from './db/supabase.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SpellCastingModule } from './modules/spell-casting/spell-casting.module';
import { SavingThrowsModule } from './modules/saving-throws/saving-throws.module';

@Module({
  imports: [UploadsModule,SpellCastingModule,SavingThrowsModule, AppConfigModule, UsersModule, GamesModule, GamePlayersModule, ScenesModule, TokensModule, GameSnapshotsModule, GameLogsModule, CombatsModule, CombatParticipantsModule, CharactersModule, MonstersModule, ActorsInGameModule, ClassesModule, RacesModule, BackgroundsModule, SpellsModule, ItemsModule, ConditionsModule, SupabaseModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
