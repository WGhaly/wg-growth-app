'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { accountabilityLinks, accountabilityComments, accountabilityAlerts, inviteTokens, users, profiles } from '@/db/schema';
import { 
  createInviteSchema, 
  acceptInviteSchema, 
  updateAccountabilityLinkSchema,
  createAccountabilityCommentSchema,
  acknowledgeAlertSchema
} from '@/lib/validators';
import { auth } from '@/lib/auth';
import { eq, and, or, desc, isNull } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 */
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send an accountability invitation via email
 */
export async function createAccountabilityInvite(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = createInviteSchema.parse(data);

    // Check if user is trying to invite themselves
    const [inviteeUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.inviteeEmail))
      .limit(1);

    if (inviteeUser?.id === session.user.id) {
      return { success: false, error: 'You cannot invite yourself as an accountability partner' };
    }

    // Generate token
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    // Create invite token
    const [invite] = await db
      .insert(inviteTokens)
      .values({
        token,
        ownerId: session.user.id,
        inviteeEmail: validatedData.inviteeEmail,
        scopesOffered: validatedData.scopes,
        expiresAt,
      })
      .returning();

    // TODO: Send email with invite link
    // const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accountability/accept?token=${token}`;
    // await sendEmail({
    //   to: validatedData.inviteeEmail,
    //   subject: 'Accountability Partnership Invitation',
    //   html: `You've been invited to be an accountability partner...`
    // });

    revalidatePath('/accountability');
    return { 
      success: true, 
      data: invite,
      inviteUrl: `/accountability/accept?token=${token}` 
    };
  } catch (error) {
    console.error('Failed to create accountability invite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invite'
    };
  }
}

/**
 * Accept an accountability invitation
 */
export async function acceptAccountabilityInvite(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = acceptInviteSchema.parse(data);

    // Find the invite token
    const [invite] = await db
      .select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.token, validatedData.token),
          isNull(inviteTokens.usedAt)
        )
      )
      .limit(1);

    if (!invite) {
      return { success: false, error: 'Invalid or expired invite token' };
    }

    // Check if token has expired
    if (new Date() > new Date(invite.expiresAt)) {
      return { success: false, error: 'This invitation has expired' };
    }

    // Check if invitee email matches current user
    if (invite.inviteeEmail !== session.user.email) {
      return { success: false, error: 'This invitation is not for your email address' };
    }

    // Check if user is trying to accept their own invite
    if (invite.ownerId === session.user.id) {
      return { success: false, error: 'You cannot accept your own invitation' };
    }

    // Check if link already exists
    const [existingLink] = await db
      .select()
      .from(accountabilityLinks)
      .where(
        and(
          eq(accountabilityLinks.ownerId, invite.ownerId),
          eq(accountabilityLinks.accountabilityPartnerId, session.user.id),
          or(
            eq(accountabilityLinks.status, 'pending'),
            eq(accountabilityLinks.status, 'active')
          )
        )
      )
      .limit(1);

    if (existingLink) {
      return { success: false, error: 'An accountability link already exists' };
    }

    // Create accountability link
    const [link] = await db
      .insert(accountabilityLinks)
      .values({
        ownerId: invite.ownerId,
        accountabilityPartnerId: session.user.id,
        scopesGranted: invite.scopesOffered,
        status: 'active',
        acceptedAt: new Date(),
      })
      .returning();

    // Mark invite as used
    await db
      .update(inviteTokens)
      .set({ usedAt: new Date() })
      .where(eq(inviteTokens.id, invite.id));

    revalidatePath('/accountability');
    return { success: true, data: link };
  } catch (error) {
    console.error('Failed to accept accountability invite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept invite'
    };
  }
}

/**
 * Get all accountability links (as owner or partner)
 */
export async function getAccountabilityLinks() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get links where user is the owner
    const ownedLinks = await db
      .select({
        link: accountabilityLinks,
        partner: {
          id: users.id,
          email: users.email,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        }
      })
      .from(accountabilityLinks)
      .leftJoin(users, eq(accountabilityLinks.accountabilityPartnerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(accountabilityLinks.ownerId, session.user.id))
      .orderBy(desc(accountabilityLinks.createdAt));

    // Get links where user is the partner
    const partnerLinks = await db
      .select({
        link: accountabilityLinks,
        owner: {
          id: users.id,
          email: users.email,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        }
      })
      .from(accountabilityLinks)
      .leftJoin(users, eq(accountabilityLinks.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(accountabilityLinks.accountabilityPartnerId, session.user.id))
      .orderBy(desc(accountabilityLinks.createdAt));

    return { 
      success: true, 
      data: {
        ownedLinks,
        partnerLinks
      }
    };
  } catch (error) {
    console.error('Failed to get accountability links:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get accountability links'
    };
  }
}

/**
 * Update an accountability link (change scopes or revoke)
 */
export async function updateAccountabilityLink(linkId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = updateAccountabilityLinkSchema.parse(data);

    // Only the owner can update the link
    const [link] = await db
      .select()
      .from(accountabilityLinks)
      .where(
        and(
          eq(accountabilityLinks.id, linkId),
          eq(accountabilityLinks.ownerId, session.user.id)
        )
      )
      .limit(1);

    if (!link) {
      return { success: false, error: 'Accountability link not found' };
    }

    const updateData: any = {};
    if (validatedData.scopes) updateData.scopesGranted = validatedData.scopes;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.status === 'revoked') {
      updateData.revokedAt = new Date();
      updateData.revocationReason = validatedData.revocationReason;
    }
    updateData.updatedAt = new Date();

    const [updatedLink] = await db
      .update(accountabilityLinks)
      .set(updateData)
      .where(eq(accountabilityLinks.id, linkId))
      .returning();

    revalidatePath('/accountability');
    return { success: true, data: updatedLink };
  } catch (error) {
    console.error('Failed to update accountability link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update link'
    };
  }
}

/**
 * Delete an accountability link
 */
export async function deleteAccountabilityLink(linkId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // User can delete if they are either the owner or the partner
    await db
      .delete(accountabilityLinks)
      .where(
        and(
          eq(accountabilityLinks.id, linkId),
          or(
            eq(accountabilityLinks.ownerId, session.user.id),
            eq(accountabilityLinks.accountabilityPartnerId, session.user.id)
          )
        )
      );

    revalidatePath('/accountability');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete accountability link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete link'
    };
  }
}

/**
 * Add a comment to a resource (for accountability partner)
 */
export async function createAccountabilityComment(linkId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = createAccountabilityCommentSchema.parse(data);

    // Verify the accountability link exists and user is the partner
    const [link] = await db
      .select()
      .from(accountabilityLinks)
      .where(
        and(
          eq(accountabilityLinks.id, linkId),
          eq(accountabilityLinks.accountabilityPartnerId, session.user.id),
          eq(accountabilityLinks.status, 'active')
        )
      )
      .limit(1);

    if (!link) {
      return { success: false, error: 'Accountability link not found or inactive' };
    }

    // Create comment
    const [comment] = await db
      .insert(accountabilityComments)
      .values({
        linkId,
        commenterId: session.user.id,
        resourceType: validatedData.resourceType,
        resourceId: validatedData.resourceId,
        comment: validatedData.comment,
        isPrayer: validatedData.isPrayer,
      })
      .returning();

    revalidatePath('/accountability');
    return { success: true, data: comment };
  } catch (error) {
    console.error('Failed to create accountability comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    };
  }
}

/**
 * Get comments for a specific resource
 */
export async function getAccountabilityComments(resourceType: string, resourceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const comments = await db
      .select({
        comment: accountabilityComments,
        commenter: {
          firstName: profiles.firstName,
          lastName: profiles.lastName,
        }
      })
      .from(accountabilityComments)
      .leftJoin(users, eq(accountabilityComments.commenterId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(accountabilityComments.resourceType, resourceType),
          eq(accountabilityComments.resourceId, resourceId)
        )
      )
      .orderBy(desc(accountabilityComments.createdAt));

    return { success: true, data: comments };
  } catch (error) {
    console.error('Failed to get accountability comments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get comments'
    };
  }
}

/**
 * Get all alerts for the user
 */
export async function getAccountabilityAlerts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get alerts for links where user is the partner
    const alerts = await db
      .select()
      .from(accountabilityAlerts)
      .leftJoin(accountabilityLinks, eq(accountabilityAlerts.linkId, accountabilityLinks.id))
      .where(
        and(
          eq(accountabilityLinks.accountabilityPartnerId, session.user.id),
          isNull(accountabilityAlerts.acknowledgedAt)
        )
      )
      .orderBy(desc(accountabilityAlerts.triggeredAt));

    return { success: true, data: alerts };
  } catch (error) {
    console.error('Failed to get accountability alerts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get alerts'
    };
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAccountabilityAlert(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = acknowledgeAlertSchema.parse(data);

    await db
      .update(accountabilityAlerts)
      .set({ acknowledgedAt: new Date() })
      .where(eq(accountabilityAlerts.id, validatedData.alertId));

    revalidatePath('/accountability');
    return { success: true };
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
    };
  }
}

/**
 * Get pending invites sent by the user
 */
export async function getPendingInvites() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const invites = await db
      .select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.ownerId, session.user.id),
          isNull(inviteTokens.usedAt)
        )
      )
      .orderBy(desc(inviteTokens.createdAt));

    return { success: true, data: invites };
  } catch (error) {
    console.error('Failed to get pending invites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get invites'
    };
  }
}
