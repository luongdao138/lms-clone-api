import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlUser } from 'src/graphql/models/User.gql';
import { GqlUserProfile } from 'src/graphql/models/UserProfile.gql';
import { UserProfileService } from '../user-profile/user-profile.service';

@Resolver(() => GqlUser)
export class UserResolver {
  constructor(private readonly userProfileService: UserProfileService) {}

  @ResolveField('profile', () => GqlUserProfile)
  async getProfile(@Parent() user: GqlUser) {
    const { profileId } = user;

    return this.userProfileService.getProfile({ where: { id: profileId } });
  }
}
